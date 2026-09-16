import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const NODE_COUNT = 150;
const LINK_DISTANCE = 1.15;
const MAX_LINKS = 420;
const RADIUS = 3.1;

/**
 * The hero backdrop: a slowly rotating shell of nodes wired to their nearest
 * neighbours — a network graph you're looking *into* rather than at.
 *
 * Links are computed once from the starting positions; re-deriving them every
 * frame is an O(n²) pass that buys nothing, since the whole lattice rotates
 * rigidly.
 */
export function NodeField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup = () => {};

    // three is a large dependency and nothing above the fold depends on it, so
    // it loads after the page is interactive. Named imports rather than a
    // namespace import, so Rollup can tree-shake the two thirds of three.js
    // this scene never touches.
    import('three')
      .then(
        ({
          Scene,
          PerspectiveCamera,
          WebGLRenderer,
          BufferGeometry,
          BufferAttribute,
          PointsMaterial,
          Points,
          LineBasicMaterial,
          LineSegments,
          Group,
        }) => {
        if (disposed || !hostRef.current) return;

        const scene = new Scene();
        const camera = new PerspectiveCamera(58, 1, 0.1, 100);
        camera.position.z = 6.4;

        const renderer = new WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        // --- node positions: a jittered spherical shell -------------------
        const positions = new Float32Array(NODE_COUNT * 3);
        const points: { x: number; y: number; z: number }[] = [];
        for (let i = 0; i < NODE_COUNT; i += 1) {
          // Fibonacci sphere keeps the distribution even; the jitter stops it
          // from reading as a manufactured pattern.
          const t = i / NODE_COUNT;
          const inclination = Math.acos(1 - 2 * t);
          const azimuth = Math.PI * (1 + Math.sqrt(5)) * i;
          const r = RADIUS * (0.72 + Math.random() * 0.28);
          const x = r * Math.sin(inclination) * Math.cos(azimuth);
          const y = r * Math.sin(inclination) * Math.sin(azimuth);
          const z = r * Math.cos(inclination);
          positions.set([x, y, z], i * 3);
          points.push({ x, y, z });
        }

        const nodeGeometry = new BufferGeometry();
        nodeGeometry.setAttribute('position', new BufferAttribute(positions, 3));
        const nodeMaterial = new PointsMaterial({
          color: 0x5fd0c4,
          size: 0.055,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.85,
        });
        const nodes = new Points(nodeGeometry, nodeMaterial);

        // --- links between near neighbours ---------------------------------
        const linkVertices: number[] = [];
        outer: for (let i = 0; i < points.length; i += 1) {
          for (let j = i + 1; j < points.length; j += 1) {
            const a = points[i];
            const b = points[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = a.z - b.z;
            if (dx * dx + dy * dy + dz * dz < LINK_DISTANCE * LINK_DISTANCE) {
              linkVertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
              if (linkVertices.length / 6 >= MAX_LINKS) break outer;
            }
          }
        }

        const linkGeometry = new BufferGeometry();
        linkGeometry.setAttribute(
          'position',
          new BufferAttribute(new Float32Array(linkVertices), 3),
        );
        const linkMaterial = new LineBasicMaterial({
          color: 0x5fd0c4,
          transparent: true,
          opacity: 0.16,
        });
        const links = new LineSegments(linkGeometry, linkMaterial);

        const group = new Group();
        group.add(nodes, links);
        group.rotation.x = 0.35;
        scene.add(group);

        // --- sizing ---------------------------------------------------------
        const resize = () => {
          const { clientWidth, clientHeight } = host;
          if (!clientWidth || !clientHeight) return;
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(host);

        // --- pointer parallax -----------------------------------------------
        const pointer = { x: 0, y: 0 };
        const onPointerMove = (event: PointerEvent) => {
          pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
          pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });

        // --- loop -------------------------------------------------------------
        let raf = 0;
        let visible = true;
        const tick = () => {
          group.rotation.y += 0.0011;
          // Ease toward the pointer rather than snapping, so the parallax
          // reads as weight instead of jitter.
          group.rotation.x += (0.35 + pointer.y * 0.18 - group.rotation.x) * 0.04;
          group.position.x += (pointer.x * 0.35 - group.position.x) * 0.04;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };

        const start = () => {
          if (!raf && visible) raf = requestAnimationFrame(tick);
        };
        const stop = () => {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
        };

        if (reducedMotion) {
          renderer.render(scene, camera);
        } else {
          start();
        }

        // Don't burn a GPU loop on a hidden tab or a scrolled-past hero.
        const onVisibility = () => {
          if (document.hidden) stop();
          else if (!reducedMotion) start();
        };
        document.addEventListener('visibilitychange', onVisibility);

        const inView = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (!visible) stop();
            else if (!reducedMotion) start();
          },
          { threshold: 0 },
        );
        inView.observe(host);

        cleanup = () => {
          stop();
          observer.disconnect();
          inView.disconnect();
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('pointermove', onPointerMove);
          nodeGeometry.dispose();
          linkGeometry.dispose();
          nodeMaterial.dispose();
          linkMaterial.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        // WebGL or the chunk itself can fail; the hero is designed to read
        // fine without the backdrop, so there's nothing to recover.
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,#000_10%,transparent_75%)]"
    />
  );
}

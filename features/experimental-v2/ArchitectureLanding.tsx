"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, MoveUpRight } from "lucide-react";
import { LazyMotion, domAnimation, m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import styles from "./architecture.module.css";

const photos = {
  scene: "/experimental-v2/casa-verde-scene.webp",
  background: "/experimental-v2/casa-verde-background-clean-v1.webp",
  foreground: "/experimental-v2/casa-verde-foreground.webp",
  foliage: "/experimental-v2/casa-verde-foliage-v1.webp",
};

export function ArchitectureLanding({ brand }: { brand: string }) {
  const hero = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  // All planes share the same crop and initial scale. Only their scroll travel differs.
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 145]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 235]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -35]);
  const foregroundScale = useTransform(scrollYProgress, [0, 1], [1.035, 1.075]);
  const foliageY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.85, 0]);
  const reveal = {
    initial: reduceMotion ? false as const : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  };

  return (
    <LazyMotion features={domAnimation} strict>
    <div className={styles.page}>
      <a href="#casa" className={styles.skipLink}>Saltar al contenido</a>
      <div className={styles.heroStage}>
      <section ref={hero} className={styles.hero} aria-labelledby="hero-title">
        <m.div className={`${styles.plane} ${styles.background}`} style={reduceMotion ? { scale: 1.035 } : { y: backgroundY, scale: 1.035 }}>
          <Image src={photos.background} alt="" fill sizes="(max-aspect-ratio: 16/9) 180vh, 100vw" quality={75} loading="eager" fetchPriority="high" className={styles.sceneImage} />
        </m.div>
        <div className={styles.skyShade} aria-hidden="true" />

        <header className={styles.header}>
          <a href="#" className={styles.brand} aria-label={`${brand}, inicio`}>{brand.replace(/ Propiedades$/, "")}{" "}<span>Propiedades</span></a>
          <nav aria-label="Navegación principal" className={styles.nav}>
            <a href="#casa">La casa</a>
            <a href="#espacios">Espacios</a>
            <a href="#concepto">El concepto</a>
          </nav>
        </header>

        <m.div className={styles.titlePlane} style={reduceMotion ? undefined : { y: titleY, opacity: titleOpacity }}>
          <div className={styles.titleIntro}><span>Una casa abierta al paisaje</span><span>Arquitectura tropical</span></div>
          <h1 id="hero-title"><span className={styles.srOnly}>Casa </span>VERDE</h1>
        </m.div>

        <m.div className={`${styles.plane} ${styles.foreground}`} style={reduceMotion ? { scale: 1.035 } : { y: foregroundY, scale: foregroundScale }}>
          <Image src={photos.foreground} alt="Casa contemporánea de hormigón y madera, con una amplia galería sobre un jardín tropical." fill sizes="(max-aspect-ratio: 16/9) 180vh, 100vw" quality={90} loading="eager" fetchPriority="high" className={styles.sceneImage} />
        </m.div>
        <div className={styles.groundShade} aria-hidden="true" />

        <div className={styles.heroBottom}>
          <p>El verde entra.<br />La vida se expande.</p>
          <a href="#casa" className={styles.discover}>Conocer la casa <span><ArrowDownRight size={23} strokeWidth={1.5} /></span></a>
        </div>
      </section>
      <m.div className={styles.foliageBridge} aria-hidden="true" style={reduceMotion ? undefined : { y: foliageY }}>
        <Image src={photos.foliage} alt="" fill sizes="(max-width: 767px) 690px, 104vw" quality={90} loading="eager" className={styles.foliageImage} />
        <Image src={photos.foliage} alt="" fill sizes="(max-width: 767px) 690px, 1px" quality={90} className={`${styles.foliageImage} ${styles.foliageRight}`} />
      </m.div>
      </div>

      <main id="casa" className={styles.main}>
        <section className={styles.introduction} aria-labelledby="introduction-title">
          <m.div {...reveal} className={styles.introHeading}>
            <span className={styles.sectionLabel}>Casa Verde</span>
            <h2 id="introduction-title">Otra forma<br />de <span>habitar.</span></h2>
            <p>Una galería que abraza la casa. Materiales que envejecen bien. Y el paisaje, siempre cerca.</p>
          </m.div>
          <m.div {...reveal} className={styles.introDetail}>
            <div className={styles.detailPhoto}>
              <Image src={photos.scene} alt="Detalle de la galería, el techo de madera y los ventanales de Casa Verde." fill sizes="(max-width: 767px) 100vw, 43vw" quality={90} className={styles.detailImage} />
            </div>
            <div className={styles.photoNote}><span>Interior y exterior, conectados.</span><MoveUpRight size={21} strokeWidth={1.5} aria-hidden="true" /></div>
          </m.div>
        </section>

        <section id="espacios" className={styles.spaces} aria-labelledby="spaces-title">
          <m.div {...reveal} className={styles.spacesHeading}>
            <h2 id="spaces-title">Espacio para<br />vivir <span>sin apuro.</span></h2>
            <p>La luz recorre los ambientes. Los ventanales desaparecen. La galería se convierte en un lugar más de la casa.</p>
          </m.div>
          <m.figure {...reveal} className={styles.panorama}>
            <Image src={photos.scene} alt="Vista completa de Casa Verde y su jardín en una ladera arbolada." fill sizes="(max-width: 767px) 160vw, 100vw" quality={90} className={styles.panoramaImage} />
          </m.figure>
          <div className={styles.materials}>
            <div><span>Hormigón</span><p>La estructura, a la vista.</p></div>
            <div><span>Madera</span><p>Calidez bajo una misma cubierta.</p></div>
            <div><span>Paisaje</span><p>Parte de cada ambiente.</p></div>
          </div>
        </section>

        <section id="concepto" className={styles.concept} aria-labelledby="concept-title">
          <m.div {...reveal}>
            <h2 id="concept-title">La arquitectura.<br />En <span>primer plano.</span></h2>
            <p>Una exploración visual de cómo presentar una propiedad a través de su arquitectura, su entorno y sus materiales.</p>
            <a href="https://www.ignacioweppler.com" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>Crear una web así <ArrowUpRight size={23} strokeWidth={1.5} /></a>
          </m.div>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>Diseño y desarrollo por <a href="https://www.ignacioweppler.com" target="_blank" rel="noopener noreferrer">Ignacio Weppler</a></span>
        <span>Concepto visual. Propiedad e imágenes de demostración.</span>
        <a href="#">Volver arriba <ArrowUpRight size={15} strokeWidth={1.5} /></a>
      </footer>
    </div>
    </LazyMotion>
  );
}

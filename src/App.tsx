import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_SERVICES } from './data/catalog';

// Persistencia local (solo cuando Supabase no está configurado: modo demostración)
const localLoad = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const localSave = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ } };
import {
  Sparkles, Calendar, Clock, User, Shield, Search, Plus, Trash2,
  Edit3, CheckCircle, XCircle, Send, Download, Share2,
  RefreshCw, Wand2, ChevronDown, Star, Heart, Phone,
  MapPin, Instagram, Menu, X, Lock, LogOut, Sliders, Award,
  Palette, Scissors, Check, ShoppingBag, ArrowRight, Undo2,
  ExternalLink, Eye, Layers, MessageCircle, Compass
} from 'lucide-react';

// ============================================================================
// CONSTANTES OFICIALES DE MARCA Y CONFIGURACIÓN
// ============================================================================
const STUDIO_ADDRESS = "Cra 3A #51C-58, Barranquilla, Colombia";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS)}`;
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, '') || '573046033920'; // WhatsApp de Vitalia (+57 304 6033920)

const buildBookingWhatsApp = (b) => {
  const msg = `Hola Vitalia Beauty Experience 💖\nQuiero confirmar mi solicitud de reserva:\n\n• Código: ${b.id}\n• Nombre: ${b.clientName}\n• Servicio: ${b.serviceName}\n• Fecha: ${b.date}\n• Hora: ${b.time}\n• Teléfono: ${b.phone}\n• Correo: ${b.email}${b.notes ? `\n• Comentarios: ${b.notes}` : ''}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '02:00 PM', '03:30 PM', '05:00 PM', '06:15 PM'
];

const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val);
};

// ============================================================================
// LOGOTIPO OFICIAL VITALIA PINK GLAM FUTURISTA
// ============================================================================
const VitaliaLogo = ({ light = false, size = 'md' }) => (
  <div className="flex items-center gap-3 select-none group">
    <div
      className={`relative rounded-2xl bg-gradient-to-tr from-[#FF168B] via-[#FF4FB8] to-[#A855F7] flex items-center justify-center text-white shadow-lg shadow-[#FF168B]/35 transition-transform duration-300 group-hover:scale-105 ${
        size === 'lg' ? 'w-12 h-12' : size === 'md' ? 'w-10 h-10' : 'w-8 h-8'
      }`}
    >
      <div className="absolute inset-0 rounded-2xl border border-white/40" />
      <Sparkles className={size === 'lg' ? 'w-6 h-6 text-[#E8BD62]' : size === 'md' ? 'w-5 h-5 text-[#E8BD62]' : 'w-4 h-4 text-[#E8BD62]'} />
    </div>
    <div>
      <span
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        className={`font-bold tracking-tight block leading-none ${
          size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base'
        } ${light ? 'text-white' : 'text-[#241126]'}`}
      >
        Vitalia
      </span>
      <span className={`text-[9px] uppercase tracking-[0.26em] font-bold block mt-1 ${light ? 'text-[#E8BD62]' : 'text-[#FF168B]'}`}>
        Beauty Experience
      </span>
    </div>
  </div>
);

// ============================================================================
// CATÁLOGO DINÁMICO: servicios y tarifas cargados desde Supabase
// ============================================================================
const GALLERY_ITEMS = [
  { id: 1, title: 'Butterfly Cut & Volumen', category: 'Cortes de cabello', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },
  { id: 2, title: 'Balayage Rubio Luminoso', category: 'Cambios de color', img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80' },
  { id: 3, title: 'Ondas Glam Alfombra Roja', category: 'Peinados', img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80' },
  { id: 4, title: 'Pink Chrome & Cristales', category: 'Diseños de uñas', img: 'https://images.unsplash.com/photo-1632345031435-8727f6c97d34?auto=format&fit=crop&w=800&q=80' },
  { id: 5, title: 'Pink Glam Futurista', category: 'Maquillajes', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' },
  { id: 6, title: 'Aura Nails Iridescentes', category: 'Diseños de uñas', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }
];

const TESTIMONIALS = []; // Se publican únicamente testimonios reales autorizados.

const FAQS = [
  {
    q: '¿Dónde está ubicado el salón Vitalia Beauty Experience?',
    a: `Nuestro Estudio Principal está ubicado en ${STUDIO_ADDRESS}. Puedes pulsar el botón "Cómo llegar" en la sección de contacto para abrir la ruta directamente en tu mapa.`
  },
  {
    q: '¿Cómo funciona la personalización de Barbie en Vitalia Beauty Lab?',
    a: 'Puedes modificar tanto las facciones de la muñeca (ojos, cejas, nariz, labios, forma de rostro y cabello) como las capas de maquillaje (base, rubor, iluminador, sombras, delineado, labiales y accesorios). El maquillaje se adapta automáticamente a cada cambio de facción.'
  },
  {
    q: '¿Cómo realizo una reserva y cómo sé si hay disponibilidad?',
    a: 'Selecciona uno o varios servicios en el catálogo o en "Mi Experiencia Vitalia", elige la fecha en el formulario de citas y el sistema te mostrará en tiempo real los horarios disponibles evitando cruces.'
  },
  {
    q: '¿Los precios y duraciones del catálogo son definitivos?',
    a: 'Los precios y duraciones publicados son los vigentes en el catálogo. Si un servicio requiere valoración previa, el equipo lo confirmará antes de la cita.'
  }
];

// ============================================================================
// ESTADO INICIAL DE LA MUÑECA BARBIE (REFERENCIA: RUBIA, FLEQUILLO RECTO, OJOS AZULES, LABIOS ROSADOS)
// ============================================================================
const INITIAL_BARBIE_FEATURES = {
  // Ojos
  eyeSize: 1.0,
  eyeShape: 'almond', // 'almond' | 'round' | 'cat'
  eyeSpacing: 0, // -6 a +6
  eyeTilt: 0, // -10 a +10 grados
  eyeColor: '#2563EB', // Azul intenso referencia
  // Cejas
  browStyle: 'arched', // 'arched' | 'straight' | 'soft' | 'bold'
  browThickness: 3.6,
  browHeight: 0, // -6 a +6
  browColor: '#B5894C',
  // Nariz
  noseSize: 1.0,
  noseWidth: 1.0,
  noseShape: 'delicate', // 'delicate' | 'button' | 'sculpted'
  // Labios
  lipSize: 1.0,
  lipWidth: 1.0,
  lipShape: 'cupid', // 'cupid' | 'plump' | 'heart'
  upperLipThickness: 1.0,
  lowerLipThickness: 1.0,
  // Rostro
  faceShape: 'oval', // 'oval' | 'heart' | 'diamond'
  cheekWidth: 0, // -8 a +8
  jawDefinition: 0, // -8 a +8
  chinSize: 0, // -6 a +8
  // Cabello
  hairColor: '#F3D27A', // Rubio luminoso referencia
  hairLength: 'long', // 'short' | 'medium' | 'long'
  hairStyle: 'sleek', // 'sleek' | 'waves' | 'glamponytail'
  hasBangs: true // Flequillo recto abundante referencia
};

const INITIAL_BARBIE_MAKEUP = {
  // Base y piel
  skinTone: '#FDE4D4',
  skinFinish: 'dewy', // 'matte' | 'satin' | 'dewy'
  blushColor: '#FF4FB8',
  blushOpacity: 0.52,
  contourOpacity: 0.25,
  highlightOpacity: 0.78,
  // Ojos
  eyeshadowStyle: 'glam', // 'natural' | 'elegant' | 'glam' | 'artistic'
  eyeshadowPrimary: '#FF9AD5',
  eyeshadowSecondary: '#FF168B',
  eyeshadowIntensity: 0.72,
  eyelinerStyle: 'winged', // 'none' | 'classic' | 'winged' | 'graphic'
  eyelinerColor: '#241126',
  mascaraLevel: 'full', // 'soft' | 'full'
  // Labios
  lipColor: '#FF4FB8',
  lipFinish: 'gloss', // 'matte' | 'satin' | 'gloss'
  // Complementos
  lashesStyle: 'doll', // 'natural' | 'doll' | 'dramatic'
  accessory: 'none', // 'none' | 'pearls' | 'crystals' | 'tiara'
  bgTheme: 'pinkglam'
};

const BARBIE_PRESETS = [
  {
    name: 'Barbie Pink (Original)',
    features: { ...INITIAL_BARBIE_FEATURES },
    makeup: { ...INITIAL_BARBIE_MAKEUP }
  },
  {
    // Morena radiante: piel canela, cabello azabache con ondas y labios coral
    name: 'Barbie Glam',
    features: { ...INITIAL_BARBIE_FEATURES, hairColor: '#2A1A14', hairStyle: 'waves', hairLength: 'long', hasBangs: false, eyeColor: '#7A4A21', eyeTilt: 5, lipSize: 1.12, browColor: '#2A1A14', browStyle: 'arched' },
    makeup: {
      ...INITIAL_BARBIE_MAKEUP,
      skinTone: '#E0A878',
      skinFinish: 'dewy',
      blushColor: '#F0735A',
      blushOpacity: 0.5,
      contourOpacity: 0.3,
      eyeshadowStyle: 'glam',
      eyeshadowPrimary: '#E8BD62',
      eyeshadowSecondary: '#B4531F',
      eyeshadowIntensity: 0.88,
      lipColor: '#E4553E',
      lipFinish: 'gloss',
      lashesStyle: 'dramatic',
      accessory: 'crystals',
      bgTheme: 'pinkglam'
    }
  },
  {
    // Fresca y natural: castaña dorada, flequillo suave, rubor durazno
    name: 'Barbie Natural',
    features: { ...INITIAL_BARBIE_FEATURES, hairColor: '#B8793F', hairStyle: 'sleek', hairLength: 'medium', hasBangs: false, eyeColor: '#4E9B6E', eyeSize: 0.98, browStyle: 'soft', browColor: '#8A5A2B', faceShape: 'heart', lipShape: 'plump' },
    makeup: {
      ...INITIAL_BARBIE_MAKEUP,
      skinTone: '#F6D2B8',
      skinFinish: 'satin',
      blushColor: '#FF8A7A',
      blushOpacity: 0.36,
      contourOpacity: 0.12,
      highlightOpacity: 0.55,
      eyeshadowStyle: 'natural',
      eyeshadowPrimary: '#F2C9B0',
      eyeshadowSecondary: '#C98F73',
      eyeshadowIntensity: 0.4,
      eyelinerStyle: 'classic',
      eyelinerColor: '#4A3228',
      mascaraLevel: 'soft',
      lipColor: '#E8938F',
      lipFinish: 'satin',
      lashesStyle: 'natural',
      accessory: 'none',
      bgTheme: 'pinkglam'
    }
  },
  {
    // Lujo: rubio platino, ojos gris azulado, tiara y fondo violeta
    name: 'Barbie Luxury',
    features: { ...INITIAL_BARBIE_FEATURES, hairColor: '#F4E3B5', hairStyle: 'waves', hairLength: 'long', hasBangs: false, faceShape: 'diamond', jawDefinition: 4, eyeColor: '#6C8EBF', eyeShape: 'cat', eyeTilt: 6, browStyle: 'bold', browColor: '#9C7A45' },
    makeup: {
      ...INITIAL_BARBIE_MAKEUP,
      skinTone: '#FBDDCB',
      skinFinish: 'satin',
      blushColor: '#E58AA8',
      blushOpacity: 0.4,
      eyeshadowStyle: 'elegant',
      eyeshadowPrimary: '#E9D7FF',
      eyeshadowSecondary: '#7B3FBF',
      eyeshadowIntensity: 0.85,
      eyelinerStyle: 'winged',
      lipColor: '#9E1B5A',
      lipFinish: 'satin',
      lashesStyle: 'dramatic',
      accessory: 'tiara',
      bgTheme: 'purple'
    }
  },
  {
    // Fiesta: cabello rosa, coleta alta, glitter y fondo nocturno
    name: 'Barbie Party',
    features: { ...INITIAL_BARBIE_FEATURES, hairColor: '#FF7AC8', hairStyle: 'glamponytail', hasBangs: true, eyeColor: '#8B5CF6', eyeTilt: 6, eyeShape: 'cat', browColor: '#C2338A' },
    makeup: {
      ...INITIAL_BARBIE_MAKEUP,
      skinTone: '#FDE4D4',
      eyeshadowStyle: 'artistic',
      eyeshadowPrimary: '#7DF9FF',
      eyeshadowSecondary: '#A855F7',
      eyeshadowIntensity: 0.95,
      eyelinerStyle: 'graphic',
      eyelinerColor: '#1B0B2E',
      blushColor: '#FF4FB8',
      lipColor: '#FF2E93',
      lipFinish: 'gloss',
      lashesStyle: 'dramatic',
      accessory: 'crystals',
      bgTheme: 'night'
    }
  },
  {
    // Fashion editorial: cabello chocolate liso sin flequillo, labios rojo cereza
    name: 'Barbie Fashion',
    features: { ...INITIAL_BARBIE_FEATURES, hairColor: '#4A2A1A', hairStyle: 'sleek', hairLength: 'long', hasBangs: false, eyeColor: '#10B981', eyeShape: 'almond', browStyle: 'straight', browColor: '#3B2314', lipSize: 1.08, faceShape: 'oval', jawDefinition: 3 },
    makeup: {
      ...INITIAL_BARBIE_MAKEUP,
      skinTone: '#F3C7AE',
      skinFinish: 'matte',
      blushColor: '#D9627A',
      blushOpacity: 0.34,
      contourOpacity: 0.32,
      eyeshadowStyle: 'elegant',
      eyeshadowPrimary: '#C98F73',
      eyeshadowSecondary: '#5B3A29',
      eyeshadowIntensity: 0.7,
      eyelinerStyle: 'winged',
      lipColor: '#C8102E',
      lipFinish: 'matte',
      lashesStyle: 'doll',
      accessory: 'pearls',
      bgTheme: 'pinkglam'
    }
  }
];

// ============================================================================
// MUÑECA VECTORIAL PARAMÉTRICA DE ALTA GAMA (FACCIONES + MAQUILLAJE ADAPTATIVO)
// ============================================================================
const BarbieDollCanvas = ({ features, makeup, svgRef }) => {
  // Cálculo paramétrico de geometría facial
  const leftEyeX = 182 - features.eyeSpacing;
  const rightEyeX = 268 + features.eyeSpacing;
  const eyeY = 236;

  // Forma de ojos
  const eyeHeightFactor =
    features.eyeShape === 'round' ? 1.22 : features.eyeShape === 'cat' ? 0.88 : 1.0;
  const eyeWidthFactor =
    features.eyeShape === 'cat' ? 1.12 : features.eyeShape === 'round' ? 0.95 : 1.0;

  // Cejas adaptadas a altura y estilo
  const browYOffset = features.browHeight;
  const getBrowPath = (isLeft) => {
    const dir = isLeft ? 1 : -1;
    const cx = isLeft ? leftEyeX : rightEyeX;
    const baseY = 205 + browYOffset;
    if (features.browStyle === 'straight') {
      return `M ${cx - 32 * dir} ${baseY + 2} Q ${cx} ${baseY - 3} ${cx + 28 * dir} ${baseY}`;
    }
    if (features.browStyle === 'soft') {
      return `M ${cx - 32 * dir} ${baseY + 5} Q ${cx} ${baseY - 7} ${cx + 28 * dir} ${baseY + 2}`;
    }
    if (features.browStyle === 'bold') {
      return `M ${cx - 34 * dir} ${baseY + 6} Q ${cx + 4 * dir} ${baseY - 12} ${cx + 30 * dir} ${baseY + 1}`;
    }
    // arched (referencia)
    return `M ${cx - 33 * dir} ${baseY + 5} Q ${cx + 3 * dir} ${baseY - 10} ${cx + 29 * dir} ${baseY + 1}`;
  };

  // Contorno de rostro paramétrico
  const cw = features.cheekWidth;
  const jd = features.jawDefinition;
  const cs = features.chinSize;
  const topWidth = features.faceShape === 'heart' ? 130 : features.faceShape === 'diamond' ? 136 : 134;
  const jawX = features.faceShape === 'diamond' ? 286 + jd : 292 + jd;
  const leftJawX = 450 - jawX;
  const chinY = 368 + cs;

  const facePath = `
    M ${topWidth - cw * 0.4} 190
    C ${topWidth - cw * 0.4} 118, 173 88, 225 88
    C 277 88, ${450 - topWidth + cw * 0.4} 118, ${450 - topWidth + cw * 0.4} 190
    C ${450 - topWidth + cw} 246, ${jawX} 316, 244 ${chinY - 4}
    Q 225 ${chinY + 8} 206 ${chinY - 4}
    C ${leftJawX} 316, ${topWidth - cw} 246, ${topWidth - cw * 0.4} 190 Z
  `;

  // Geometría de labios paramétricos
  const lw = 34 * features.lipWidth * features.lipSize;
  const uThick = 11 * features.upperLipThickness * features.lipSize;
  const lThick = 16 * features.lowerLipThickness * features.lipSize;
  const cupidDip = features.lipShape === 'heart' ? 3.5 : features.lipShape === 'plump' ? 7 : 5.5;

  const upperLipPath = `
    M ${-lw} 0
    Q ${-lw * 0.48} ${-uThick * 1.15} ${-lw * 0.16} ${-uThick * 0.72}
    Q 0 ${-cupidDip} ${lw * 0.16} ${-uThick * 0.72}
    Q ${lw * 0.48} ${-uThick * 1.15} ${lw} 0
    Q 0 3.2 ${-lw} 0 Z
  `;

  const lowerLipPath = `
    M ${-lw * 0.92} 0.5
    Q 0 3.5 ${lw * 0.92} 0.5
    Q ${lw * 0.58} ${lThick * 1.15} 0 ${lThick * 1.18}
    Q ${-lw * 0.58} ${lThick * 1.15} ${-lw * 0.92} 0.5 Z
  `;

  // Largo de cabello
  const hairBottomY = features.hairLength === 'short' ? 355 : features.hairLength === 'medium' ? 445 : 525;

  const bgColors = {
    pinkglam: ['#FFD6EC', '#FFFFFF', '#E9D5FF'],
    purple: ['#E9D5FF', '#FFF5FB', '#FDE68A'],
    night: ['#241126', '#6426B8', '#241126']
  };
  const currentBg = bgColors[makeup.bgTheme] || bgColors.pinkglam;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 450 540"
      className="w-full h-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="barbieBgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={currentBg[0]} />
          <stop offset="50%" stopColor={currentBg[1]} />
          <stop offset="100%" stopColor={currentBg[2]} />
        </linearGradient>

        <radialGradient id="hairDepth" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="barbieAura" cx="50%" cy="42%" r="48%">
          <stop offset="0%" stopColor="#FF168B" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#A855F7" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="barbieHairSilk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="28%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#FFFDF5" stopOpacity="0.58" />
          <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="barbieSkinGlow" cx="50%" cy="36%" r="58%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={makeup.skinFinish === 'dewy' ? 0.46 : makeup.skinFinish === 'satin' ? 0.24 : 0.04} />
          <stop offset="72%" stopColor={makeup.skinTone} stopOpacity="0" />
          <stop offset="100%" stopColor="#241126" stopOpacity="0.14" />
        </radialGradient>

        <radialGradient id="barbieBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={makeup.blushColor} stopOpacity={makeup.blushOpacity} />
          <stop offset="65%" stopColor={makeup.blushColor} stopOpacity={makeup.blushOpacity * 0.42} />
          <stop offset="100%" stopColor={makeup.blushColor} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="barbieHighlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={makeup.highlightOpacity} />
          <stop offset="55%" stopColor="#E8BD62" stopOpacity={makeup.highlightOpacity * 0.4} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="barbieShadowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={makeup.eyeshadowPrimary} stopOpacity={makeup.eyeshadowIntensity * 0.9} />
          <stop offset="55%" stopColor={makeup.eyeshadowSecondary} stopOpacity={makeup.eyeshadowIntensity} />
          <stop offset="100%" stopColor={makeup.eyeshadowPrimary} stopOpacity={makeup.eyeshadowIntensity * 0.78} />
        </linearGradient>

        <linearGradient id="barbieLipGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={makeup.lipFinish === 'gloss' ? 0.74 : makeup.lipFinish === 'satin' ? 0.3 : 0.02} />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#241126" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="barbieTopDress" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF168B" />
          <stop offset="50%" stopColor="#FF4FB8" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* FONDO Y MARCO DE LUJO */}
      <rect width="450" height="540" fill="url(#barbieBgGrad)" />
      <circle cx="225" cy="240" r="215" fill="url(#barbieAura)" />
      <rect x="14" y="14" width="422" height="512" rx="26" fill="none" stroke="#E8BD62" strokeOpacity="0.55" strokeWidth="1.4" />

      {/* CABELLO POSTERIOR (CON LARGO Y PEINADO DINÁMICOS) */}
      {features.hairStyle === 'glamponytail' ? (
        <g>
          <path
            d={`M 160 80 C 120 40, 330 40, 290 80 C 340 160, 355 ${hairBottomY - 60}, 330 ${hairBottomY} L 120 ${hairBottomY} C 95 ${hairBottomY - 60}, 110 160, 160 80 Z`}
            fill={features.hairColor}
          />
          <ellipse cx="225" cy="54" rx="52" ry="26" fill={features.hairColor} />
          <path d="M 185 68 Q 225 78 265 68" stroke="#FF168B" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path
            d={
              features.hairStyle === 'waves'
                ? `M 94 172 C 62 245, 58 340, 76 410 C 60 455, 72 ${hairBottomY}, 94 ${hairBottomY} L 356 ${hairBottomY} C 378 ${hairBottomY}, 390 455, 374 410 C 392 340, 388 245, 356 172 C 342 75, 295 42, 225 42 C 155 42, 108 75, 94 172 Z`
                : `M 96 174 C 72 245, 66 390, 84 ${hairBottomY} L 366 ${hairBottomY} C 384 390, 378 245, 354 174 C 340 76, 295 42, 225 42 C 155 42, 110 76, 96 174 Z`
            }
            fill={features.hairColor}
          />
          <path
            d={`M 118 205 C 102 280, 100 ${hairBottomY - 40}, 114 ${hairBottomY} L 336 ${hairBottomY} C 350 ${hairBottomY - 40}, 348 280, 332 205 Z`}
            fill="url(#hairDepth)"
          />
          <path d="M 120 120 C 98 200, 96 300, 108 380" stroke="#FFFFFF" strokeOpacity="0.38" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 330 120 C 352 200, 354 300, 342 380" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* TIARA (SI ESTÁ SELECCIONADA) */}
      {makeup.accessory === 'tiara' && (
        <g transform="translate(225, 52)">
          <path d="M -55 18 L -36 -4 L -16 10 L 0 -16 L 16 10 L 36 -4 L 55 18 Z" fill="#E8BD62" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="0" cy="-6" r="4" fill="#FF168B" />
          <circle cx="-32" cy="4" r="2.8" fill="#FF4FB8" />
          <circle cx="32" cy="4" r="2.8" fill="#FF4FB8" />
        </g>
      )}

      {/* CUELLO Y ESCOTE GLAM */}
      <path
        d="M 192 352 L 188 424 C 145 437, 106 462, 90 526 L 360 526 C 344 462, 305 437, 262 424 L 258 352 Z"
        fill={makeup.skinTone}
      />
      <path d="M 191 360 Q 225 385 259 360 L 258 392 Q 225 404 192 392 Z" fill="#241126" fillOpacity="0.14" />
      <path d="M 112 464 Q 225 514 338 464 L 362 540 L 88 540 Z" fill="url(#barbieTopDress)" />
      <path d="M 112 464 Q 225 514 338 464" fill="none" stroke="#E8BD62" strokeWidth="2.5" />

      {/* ROSTRO PARAMÉTRICO */}
      <path d={facePath} fill={makeup.skinTone} />
      <path d={facePath} fill="url(#barbieSkinGlow)" />

      {/* CONTORNO Y RUBOR ADAPTADO A ANCHO DE MEJILLAS */}
      {makeup.contourOpacity > 0 && (
        <g fill="#6B3A2A" fillOpacity={makeup.contourOpacity}>
          <ellipse cx={146 - cw * 0.5} cy="285" rx="11" ry="34" transform={`rotate(-18 ${146 - cw * 0.5} 285)`} />
          <ellipse cx={304 + cw * 0.5} cy="285" rx="11" ry="34" transform={`rotate(18 ${304 + cw * 0.5} 285)`} />
        </g>
      )}
      <ellipse cx={166 - cw * 0.45} cy="272" rx="28" ry="18" fill="url(#barbieBlush)" />
      <ellipse cx={284 + cw * 0.45} cy="272" rx="28" ry="18" fill="url(#barbieBlush)" />
      <ellipse cx={163 - cw * 0.45} cy="257" rx="19" ry="7" transform={`rotate(-18 ${163 - cw * 0.45} 257)`} fill="url(#barbieHighlight)" />
      <ellipse cx={287 + cw * 0.45} cy="257" rx="19" ry="7" transform={`rotate(18 ${287 + cw * 0.45} 257)`} fill="url(#barbieHighlight)" />

      {/* SOMBRAS DE OJOS ADAPTADAS A POSICIÓN, TAMAÑO E INCLINACIÓN DE OJOS */}
      {makeup.eyeshadowIntensity > 0 && (
        <g>
          <g transform={`translate(${leftEyeX}, ${eyeY - 4}) rotate(${-features.eyeTilt}) scale(${features.eyeSize * eyeWidthFactor}, ${features.eyeSize * eyeHeightFactor})`}>
            <ellipse
              cx="0"
              cy="0"
              rx={makeup.eyeshadowStyle === 'artistic' ? 35 : makeup.eyeshadowStyle === 'glam' ? 32 : 28}
              ry={makeup.eyeshadowStyle === 'natural' ? 10 : 14}
              fill="url(#barbieShadowGrad)"
            />
          </g>
          <g transform={`translate(${rightEyeX}, ${eyeY - 4}) rotate(${features.eyeTilt}) scale(${features.eyeSize * eyeWidthFactor}, ${features.eyeSize * eyeHeightFactor})`}>
            <ellipse
              cx="0"
              cy="0"
              rx={makeup.eyeshadowStyle === 'artistic' ? 35 : makeup.eyeshadowStyle === 'glam' ? 32 : 28}
              ry={makeup.eyeshadowStyle === 'natural' ? 10 : 14}
              fill="url(#barbieShadowGrad)"
            />
          </g>
        </g>
      )}

      {/* OJO IZQUIERDO PARAMÉTRICO */}
      <g transform={`translate(${leftEyeX}, ${eyeY}) rotate(${-features.eyeTilt}) scale(${features.eyeSize * eyeWidthFactor}, ${features.eyeSize * eyeHeightFactor})`}>
        <path d="M -28 1 Q 0 -18 28 2 Q 0 14 -28 1 Z" fill="#FFFFFF" />
        <circle cx="0" cy="-1" r="12" fill={features.eyeColor} />
        <circle cx="0" cy="-1" r="8.5" fill="#1D4ED8" fillOpacity="0.45" />
        <circle cx="0" cy="-1" r="5.2" fill="#090D16" />
        <circle cx="-4.2" cy="-5.2" r="3.2" fill="#FFFFFF" />
        <circle cx="3.8" cy="3.2" r="1.4" fill="#FFFFFF" fillOpacity="0.85" />

        {/* Delineado */}
        {makeup.eyelinerStyle !== 'none' && (
          <path
            d={
              makeup.eyelinerStyle === 'winged'
                ? 'M -36 -5 Q -26 -2 -28 1 Q 0 -18 28 2'
                : makeup.eyelinerStyle === 'graphic'
                ? 'M -38 -8 L -28 1 Q 0 -19 28 2 M -26 -10 Q 0 -22 22 -8'
                : 'M -29 1 Q 0 -18 28 2'
            }
            stroke={makeup.eyelinerColor}
            fill="none"
            strokeWidth={makeup.eyelinerStyle === 'winged' ? 3.2 : 2.5}
            strokeLinecap="round"
          />
        )}

        {/* Pestañas de muñeca */}
        <g stroke="#180D1A" strokeLinecap="round" fill="none">
          <path d="M -25 -2 L -34 -10" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.4 : 1.7} />
          <path d="M -18 -8 L -25 -17" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.4 : 1.7} />
          <path d="M -10 -12 L -14 -21" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.3 : 1.6} />
          <path d="M -1 -14 L -2 -22" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.2 : 1.5} />
          <path d="M 8 -12 L 9 -20" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.0 : 1.4} />
          {makeup.lashesStyle !== 'natural' && (
            <>
              <path d="M -22 -5 L -30 -14" strokeWidth="1.6" />
              <path d="M -14 -10 L -19 -19" strokeWidth="1.6" />
              <path d="M -14 10 L -16 14" strokeWidth="1.1" opacity="0.65" />
              <path d="M -4 12 L -4 16" strokeWidth="1.1" opacity="0.65" />
              <path d="M 6 11 L 7 15" strokeWidth="1.1" opacity="0.65" />
            </>
          )}
        </g>
      </g>

      {/* OJO DERECHO PARAMÉTRICO */}
      <g transform={`translate(${rightEyeX}, ${eyeY}) rotate(${features.eyeTilt}) scale(${features.eyeSize * eyeWidthFactor}, ${features.eyeSize * eyeHeightFactor})`}>
        <path d="M 28 1 Q 0 -18 -28 2 Q 0 14 28 1 Z" fill="#FFFFFF" />
        <circle cx="0" cy="-1" r="12" fill={features.eyeColor} />
        <circle cx="0" cy="-1" r="8.5" fill="#1D4ED8" fillOpacity="0.45" />
        <circle cx="0" cy="-1" r="5.2" fill="#090D16" />
        <circle cx="-4.2" cy="-5.2" r="3.2" fill="#FFFFFF" />
        <circle cx="3.8" cy="3.2" r="1.4" fill="#FFFFFF" fillOpacity="0.85" />

        {makeup.eyelinerStyle !== 'none' && (
          <path
            d={
              makeup.eyelinerStyle === 'winged'
                ? 'M 36 -5 Q 26 -2 28 1 Q 0 -18 -28 2'
                : makeup.eyelinerStyle === 'graphic'
                ? 'M 38 -8 L 28 1 Q 0 -19 -28 2 M 26 -10 Q 0 -22 -22 -8'
                : 'M 29 1 Q 0 -18 -28 2'
            }
            stroke={makeup.eyelinerColor}
            fill="none"
            strokeWidth={makeup.eyelinerStyle === 'winged' ? 3.2 : 2.5}
            strokeLinecap="round"
          />
        )}

        <g stroke="#180D1A" strokeLinecap="round" fill="none">
          <path d="M 25 -2 L 34 -10" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.4 : 1.7} />
          <path d="M 18 -8 L 25 -17" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.4 : 1.7} />
          <path d="M 10 -12 L 14 -21" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.3 : 1.6} />
          <path d="M 1 -14 L 2 -22" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.2 : 1.5} />
          <path d="M -8 -12 L -9 -20" strokeWidth={makeup.lashesStyle === 'dramatic' ? 2.0 : 1.4} />
          {makeup.lashesStyle !== 'natural' && (
            <>
              <path d="M 22 -5 L 30 -14" strokeWidth="1.6" />
              <path d="M 14 -10 L 19 -19" strokeWidth="1.6" />
              <path d="M 14 10 L 16 14" strokeWidth="1.1" opacity="0.65" />
              <path d="M 4 12 L 4 16" strokeWidth="1.1" opacity="0.65" />
              <path d="M -6 11 L -7 15" strokeWidth="1.1" opacity="0.65" />
            </>
          )}
        </g>
      </g>

      {/* CEJAS PARAMÉTRICAS */}
      <g stroke={features.browColor} fill="none" strokeLinecap="round" strokeWidth={features.browThickness} opacity="0.92">
        <path d={getBrowPath(true)} />
        <path d={getBrowPath(false)} />
      </g>

      {/* NARIZ PARAMÉTRICA */}
      <g transform={`translate(225, 278) scale(${features.noseWidth * features.noseSize}, ${features.noseSize})`}>
        {features.noseShape === 'button' ? (
          <>
            <path d="M -7 2 Q 0 8 7 2" fill="none" stroke="#3D221B" strokeOpacity="0.34" strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="0" cy="-1" rx="4.5" ry="3.2" fill="url(#barbieHighlight)" />
          </>
        ) : features.noseShape === 'sculpted' ? (
          <>
            <path d="M -3 -26 L -4 0 M 3 -26 L 4 0" stroke="#3D221B" strokeOpacity="0.16" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M -10 2 Q 0 9 10 2" fill="none" stroke="#3D221B" strokeOpacity="0.36" strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="0" cy="-8" rx="2.5" ry="14" fill="url(#barbieHighlight)" />
          </>
        ) : (
          <>
            <path d="M -9 2 Q 0 8.5 9 2" fill="none" stroke="#3D221B" strokeOpacity="0.34" strokeWidth="1.7" strokeLinecap="round" />
            <ellipse cx="0" cy="-2" rx="3.2" ry="6" fill="url(#barbieHighlight)" />
          </>
        )}
      </g>

      {/* LABIOS PARAMÉTRICOS CON SONRISA SUTIL */}
      <g transform="translate(225, 316)">
        <path d={upperLipPath} fill={makeup.lipColor} />
        <path d={lowerLipPath} fill={makeup.lipColor} />
        <path d={upperLipPath} fill="url(#barbieLipGloss)" />
        <path d={lowerLipPath} fill="url(#barbieLipGloss)" />
        {/* Línea sutil de sonrisa */}
        <path
          d={`M ${-lw * 0.94} 0.2 Q 0 2.8 ${lw * 0.94} 0.2`}
          fill="none"
          stroke="#4A0E2E"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {makeup.lipFinish === 'gloss' && (
          <ellipse cx="0" cy={lThick * 0.55} rx={lw * 0.34} ry={lThick * 0.22} fill="#FFFFFF" fillOpacity="0.62" />
        )}
      </g>

      {/* MECHONES FRONTALES Y FLEQUILLO RECTO ABUNDANTE (REFERENCIA BARBIE) */}
      <path
        d={`M 134 150 C 115 215, 110 340, 122 ${hairBottomY} L 92 ${hairBottomY} C 76 385, 76 245, 96 168 C 106 125, 122 95, 146 76 Z`}
        fill={features.hairColor}
      />
      <path
        d={`M 316 150 C 335 215, 340 340, 328 ${hairBottomY} L 358 ${hairBottomY} C 374 385, 374 245, 354 168 C 344 125, 328 95, 304 76 Z`}
        fill={features.hairColor}
      />

      {features.hasBangs ? (
        <g>
          {/* Flequillo recto abundante característico */}
          <path
            d="M 122 184 C 122 104, 165 62, 225 62 C 285 62, 328 104, 328 184 Q 275 178 225 180 Q 175 178 122 184 Z"
            fill={features.hairColor}
          />
          <path
            d="M 122 184 C 122 104, 165 62, 225 62 C 285 62, 328 104, 328 184 Q 275 178 225 180 Q 175 178 122 184 Z"
            fill="url(#barbieHairSilk)"
          />
          {/* Textura de hebras en el flequillo */}
          <g stroke="#000000" strokeOpacity="0.1" strokeWidth="1.2">
            <line x1="152" y1="115" x2="146" y2="181" />
            <line x1="178" y1="95" x2="175" y2="180" />
            <line x1="204" y1="88" x2="203" y2="179" />
            <line x1="226" y1="86" x2="226" y2="179" />
            <line x1="250" y1="89" x2="251" y2="179" />
            <line x1="276" y1="98" x2="279" y2="180" />
            <line x1="300" y1="118" x2="305" y2="181" />
          </g>
        </g>
      ) : (
        <g>
          {/* Raya al medio elegante si se desactiva el flequillo */}
          <path
            d="M 225 62 C 175 64, 134 102, 124 176 L 136 184 C 148 122, 184 88, 225 74 C 266 88, 302 122, 314 184 L 326 176 C 316 102, 275 64, 225 62 Z"
            fill={features.hairColor}
          />
        </g>
      )}

      {/* COMPLEMENTOS ADICIONALES */}
      {makeup.accessory === 'pearls' && (
        <g>
          <circle cx="128" cy="278" r="6.5" fill="#FFFDF9" stroke="#E8BD62" strokeWidth="1.3" />
          <circle cx="322" cy="278" r="6.5" fill="#FFFDF9" stroke="#E8BD62" strokeWidth="1.3" />
        </g>
      )}
      {makeup.accessory === 'crystals' && (
        <g fill="#FFFFFF" stroke="#FF168B" strokeWidth="0.9">
          <polygon points={`${leftEyeX - 36},244 ${leftEyeX - 33},239 ${leftEyeX - 30},244 ${leftEyeX - 33},249`} />
          <polygon points={`${rightEyeX + 36},244 ${rightEyeX + 33},239 ${rightEyeX + 30},244 ${rightEyeX + 33},249`} />
          <circle cx={leftEyeX - 28} cy="252" r="2.2" />
          <circle cx={rightEyeX + 28} cy="252" r="2.2" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// ESTUDIO INTERACTIVO: VITALIA BEAUTY LAB + PERSONALIZA TU BARBIE
// ============================================================================
const VitaliaBeautyLab = ({ onOpenRecommender, onBookLook, notify }) => {
  const [features, setFeatures] = useState(INITIAL_BARBIE_FEATURES);
  const [makeup, setMakeup] = useState(INITIAL_BARBIE_MAKEUP);
  const [history, setHistory] = useState([]);
  const [studioMode, setStudioMode] = useState('facciones'); // 'facciones' | 'maquillaje'
  const [featureTab, setFeatureTab] = useState('ojos'); // 'ojos' | 'cejas' | 'nariz' | 'labios' | 'rostro' | 'cabello'
  const [makeupTab, setMakeupTab] = useState('ojos'); // 'piel' | 'ojos' | 'labios' | 'extras'
  const [compareBeforeAfter, setCompareBeforeAfter] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const svgRef = useRef(null);

  const pushHistory = () => {
    setHistory((prev) => [...prev.slice(-14), { features: { ...features }, makeup: { ...makeup } }]);
  };

  const updateFeature = (key, value) => {
    pushHistory();
    setFeatures((prev) => ({ ...prev, [key]: value }));
  };

  const updateMakeup = (key, value) => {
    pushHistory();
    setMakeup((prev) => ({ ...prev, [key]: value }));
  };

  const handleUndo = () => {
    if (history.length === 0) {
      notify('No hay cambios previos para deshacer.', 'info');
      return;
    }
    const last = history[history.length - 1];
    setFeatures(last.features);
    setMakeup(last.makeup);
    setHistory((prev) => prev.slice(0, -1));
    notify('Cambio anterior restaurado.', 'info');
  };

  const resetAll = () => {
    pushHistory();
    setFeatures(INITIAL_BARBIE_FEATURES);
    setMakeup(INITIAL_BARBIE_MAKEUP);
    notify('Barbie restablecida a su diseño original.', 'info');
  };

  const applyPreset = (preset) => {
    pushHistory();
    setFeatures({ ...preset.features });
    setMakeup({ ...preset.makeup });
    notify(`Estilo "${preset.name}" aplicado.`, 'success');
  };

  const randomizeCombination = () => {
    pushHistory();
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    setMakeup((prev) => ({
      ...prev,
      eyeshadowPrimary: pick(['#FF9AD5', '#D8B4FE', '#E8BD62', '#FF6B6B']),
      eyeshadowSecondary: pick(['#FF168B', '#A855F7', '#D90087', '#6426B8']),
      eyeshadowIntensity: 0.85,
      lipColor: pick(['#FF168B', '#FF4FB8', '#D90087', '#FF6B6B', '#A855F7']),
      lipFinish: pick(['gloss', 'satin', 'matte']),
      blushColor: pick(['#FF4FB8', '#FF168B', '#FF6B6B']),
      accessory: pick(['none', 'pearls', 'crystals', 'tiara'])
    }));
    notify('¡Nueva combinación glam generada!', 'success');
  };

  const saveCurrentDesign = () => {
    const entry = {
      id: Date.now(),
      name: `Diseño #${savedDesigns.length + 1}`,
      features: { ...features },
      makeup: { ...makeup }
    };
    setSavedDesigns((prev) => [entry, ...prev.slice(0, 3)]);
    notify('Diseño guardado en tu galería de sesión.', 'success');
  };

  const handleDownloadPNG = () => {
    try {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Vitalia-Mi-Barbie-${Date.now()}.png`;
        link.href = pngUrl;
        link.click();
        notify('Imagen PNG descargada con éxito.', 'success');
      };
      img.src = url;
    } catch (_) {
      notify('No fue posible descargar la imagen en este dispositivo.', 'error');
    }
  };

  const handleShareLook = async () => {
    const shareText = `¡Mira la Barbie y el maquillaje que creé en Vitalia Beauty Experience (${STUDIO_ADDRESS})!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi Creación en Vitalia Beauty Lab', text: shareText, url: window.location.href });
      } catch (_) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      notify('Descripción del look copiada al portapapeles para compartir.', 'success');
    }
  };

  return (
    <section id="beauty-lab" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#FFF0F9] to-[#F5E8FF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF168B]/15 to-[#A855F7]/15 border border-[#FF168B]/30 text-[#FF168B] text-xs font-bold tracking-[0.2em] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E8BD62]" /> Experiencia Estrella Interactiva
          </span>
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-[#241126] via-[#FF168B] to-[#6426B8] bg-clip-text text-transparent mb-3"
          >
            Vitalia Beauty Lab & Personaliza tu Barbie
          </h2>
          <p className="text-[#241126]/75 text-sm sm:text-base">
            Esculpe las facciones de nuestra musa Barbie y aplica maquillaje profesional adaptativo en tiempo real.
          </p>
        </div>

        {/* BARRA DE ESTILOS PREDISEÑADOS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6426B8]">Estilos Prediseñados</span>
            <button
              onClick={() => setCompareBeforeAfter(!compareBeforeAfter)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                compareBeforeAfter
                  ? 'bg-[#241126] text-[#E8BD62] border-[#241126]'
                  : 'bg-white text-[#241126] border-[#FF4FB8]/40 hover:border-[#FF168B]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> {compareBeforeAfter ? 'Viendo: Barbie Original (Antes)' : 'Comparar Antes / Después'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {BARBIE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-[#FF4FB8]/30 text-[#241126] hover:bg-gradient-to-r hover:from-[#FF168B] hover:to-[#A855F7] hover:text-white transition shadow-sm"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL DEL ESTUDIO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white/95 backdrop-blur-xl rounded-[2.2rem] border border-[#FF4FB8]/30 shadow-2xl shadow-[#FF168B]/10 p-4 sm:p-8">
          {/* COLUMNA CENTRAL: MUÑECA PROTAGONISTA */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-[460px] aspect-[5/6] rounded-[2rem] overflow-hidden shadow-2xl border-2 border-[#FF4FB8]/40">
              <BarbieDollCanvas
                features={compareBeforeAfter ? INITIAL_BARBIE_FEATURES : features}
                makeup={compareBeforeAfter ? INITIAL_BARBIE_MAKEUP : makeup}
                svgRef={svgRef}
              />
              {compareBeforeAfter && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#241126]/90 text-[#E8BD62] text-[11px] font-bold">
                  Vista Original (Antes)
                </div>
              )}
            </div>

            {/* CONTROLES DE ACCIÓN DEL LIENZO */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <button
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#F5E8FF] text-[#6426B8] text-xs font-bold hover:bg-[#E9D5FF] transition"
              >
                <Undo2 className="w-3.5 h-3.5" /> Deshacer
              </button>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#FFE4F3] text-[#FF168B] text-xs font-bold hover:bg-[#FFCCE8] transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Original
              </button>
              <button
                onClick={randomizeCombination}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white text-xs font-bold shadow-md hover:opacity-95 transition"
              >
                <Wand2 className="w-3.5 h-3.5" /> Combinación
              </button>
              <button
                onClick={saveCurrentDesign}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white border border-[#FF4FB8]/40 text-[#241126] text-xs font-bold hover:bg-pink-50 transition"
              >
                <Heart className="w-3.5 h-3.5 text-[#FF168B]" /> Guardar
              </button>
              <button
                onClick={handleDownloadPNG}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-amber-50 border border-[#E8BD62] text-[#241126] text-xs font-bold hover:bg-amber-100 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#D97706]" /> PNG
              </button>
              <button
                onClick={handleShareLook}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white border border-purple-200 text-[#6426B8] text-xs font-bold hover:bg-purple-50 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DISEÑOS GUARDADOS EN SESIÓN */}
            {savedDesigns.length > 0 && (
              <div className="w-full max-w-[460px] mt-4 p-3 rounded-2xl bg-[#FFF5FB] border border-[#FF4FB8]/25">
                <span className="text-[11px] font-bold text-[#FF168B] block mb-2">Tus Diseños Guardados:</span>
                <div className="flex flex-wrap gap-2">
                  {savedDesigns.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setFeatures(d.features);
                        setMakeup(d.makeup);
                        notify(`Cargado ${d.name}`, 'info');
                      }}
                      className="px-3 py-1 rounded-full bg-white border border-[#FF4FB8]/30 text-xs font-semibold hover:bg-[#FF168B] hover:text-white transition"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: PANELES DE PERSONALIZACIÓN */}
          <div className="lg:col-span-6 space-y-5">
            {/* SELECTOR PRINCIPAL DE MODO */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#241126]">
              <button
                onClick={() => setStudioMode('facciones')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                  studioMode === 'facciones'
                    ? 'bg-gradient-to-r from-[#FF168B] to-[#FF4FB8] text-white shadow-lg'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" /> Personaliza tu Barbie
              </button>
              <button
                onClick={() => setStudioMode('maquillaje')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                  studioMode === 'maquillaje'
                    ? 'bg-gradient-to-r from-[#A855F7] to-[#FF168B] text-white shadow-lg'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" /> Simulador de Maquillaje
              </button>
            </div>

            {/* MODO 1: PERSONALIZACIÓN DE FACCIONES */}
            {studioMode === 'facciones' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-gradient-to-r from-[#FFE4F3] to-[#F3E8FF]">
                  {[
                    { id: 'ojos', label: 'Ojos' },
                    { id: 'cejas', label: 'Cejas' },
                    { id: 'nariz', label: 'Nariz' },
                    { id: 'labios', label: 'Labios' },
                    { id: 'rostro', label: 'Rostro' },
                    { id: 'cabello', label: 'Cabello' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFeatureTab(t.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                        featureTab === t.id
                          ? 'bg-[#FF168B] text-white shadow'
                          : 'text-[#241126]/75 hover:bg-white/70'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="bg-[#FFF9FD] rounded-2xl border border-[#FF4FB8]/25 p-5 min-h-[340px] space-y-4">
                  {featureTab === 'ojos' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Forma de Ojos</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'almond', label: 'Almendrados' },
                            { id: 'round', label: 'Muñeca Grandes' },
                            { id: 'cat', label: 'Felinos Glam' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => updateFeature('eyeShape', s.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                                features.eyeShape === s.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Color de Ojos</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: 'Azul Barbie', hex: '#2563EB' },
                            { name: 'Zafiro Claro', hex: '#38BDF8' },
                            { name: 'Esmeralda', hex: '#10B981' },
                            { name: 'Miel Dorado', hex: '#B45309' },
                            { name: 'Violeta Glam', hex: '#7C3AED' },
                            { name: 'Chocolate', hex: '#451A03' }
                          ].map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => updateFeature('eyeColor', c.hex)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                                features.eyeColor === c.hex ? 'border-[#FF168B] bg-pink-100/70' : 'bg-white border-pink-100'
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Tamaño: {Math.round(features.eyeSize * 100)}%</span>
                          <input type="range" min="0.85" max="1.18" step="0.02" value={features.eyeSize} onChange={(e) => updateFeature('eyeSize', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Separación: {features.eyeSpacing}</span>
                          <input type="range" min="-6" max="6" step="1" value={features.eyeSpacing} onChange={(e) => updateFeature('eyeSpacing', parseInt(e.target.value, 10))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Inclinación: {features.eyeTilt}°</span>
                          <input type="range" min="-8" max="10" step="1" value={features.eyeTilt} onChange={(e) => updateFeature('eyeTilt', parseInt(e.target.value, 10))} className="w-full accent-[#FF168B]" />
                        </div>
                      </div>
                    </>
                  )}

                  {featureTab === 'cejas' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Estilo de Cejas</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'arched', label: 'Arqueadas' },
                            { id: 'soft', label: 'Suaves' },
                            { id: 'straight', label: 'Rectas' },
                            { id: 'bold', label: 'Definidas' }
                          ].map((b) => (
                            <button
                              key={b.id}
                              onClick={() => updateFeature('browStyle', b.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                                features.browStyle === b.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-bold block mb-1">Grosor: {features.browThickness}px</span>
                          <input type="range" min="2.2" max="5.5" step="0.2" value={features.browThickness} onChange={(e) => updateFeature('browThickness', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block mb-1">Altura: {features.browHeight}</span>
                          <input type="range" min="-6" max="5" step="1" value={features.browHeight} onChange={(e) => updateFeature('browHeight', parseInt(e.target.value, 10))} className="w-full accent-[#FF168B]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Color de Cejas</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: 'Rubio Dorado', hex: '#B5894C' },
                            { name: 'Castaño Claro', hex: '#855832' },
                            { name: 'Castaño Oscuro', hex: '#4A2C18' },
                            { name: 'Negro Seda', hex: '#1F1218' }
                          ].map((bc) => (
                            <button
                              key={bc.hex}
                              onClick={() => updateFeature('browColor', bc.hex)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                                features.browColor === bc.hex ? 'border-[#FF168B] bg-pink-100/70' : 'bg-white border-pink-100'
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: bc.hex }} />
                              {bc.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {featureTab === 'nariz' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Forma Visual de Nariz</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'delicate', label: 'Delicada' },
                            { id: 'button', label: 'Respingada' },
                            { id: 'sculpted', label: 'Perfilada' }
                          ].map((n) => (
                            <button
                              key={n.id}
                              onClick={() => updateFeature('noseShape', n.id)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold border ${
                                features.noseShape === n.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                              }`}
                            >
                              {n.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="text-xs font-bold block mb-1">Tamaño General: {Math.round(features.noseSize * 100)}%</span>
                          <input type="range" min="0.82" max="1.2" step="0.02" value={features.noseSize} onChange={(e) => updateFeature('noseSize', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block mb-1">Ancho: {Math.round(features.noseWidth * 100)}%</span>
                          <input type="range" min="0.8" max="1.25" step="0.02" value={features.noseWidth} onChange={(e) => updateFeature('noseWidth', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                      </div>
                    </>
                  )}

                  {featureTab === 'labios' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Forma de Labios</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'cupid', label: 'Arco de Cupido' },
                            { id: 'plump', label: 'Voluminosos' },
                            { id: 'heart', label: 'Corazón Doll' }
                          ].map((l) => (
                            <button
                              key={l.id}
                              onClick={() => updateFeature('lipShape', l.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                                features.lipShape === l.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                              }`}
                            >
                              {l.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Volumen / Tamaño: {Math.round(features.lipSize * 100)}%</span>
                          <input type="range" min="0.85" max="1.22" step="0.02" value={features.lipSize} onChange={(e) => updateFeature('lipSize', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Ancho: {Math.round(features.lipWidth * 100)}%</span>
                          <input type="range" min="0.85" max="1.2" step="0.02" value={features.lipWidth} onChange={(e) => updateFeature('lipWidth', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Grosor Labio Superior: {Math.round(features.upperLipThickness * 100)}%</span>
                          <input type="range" min="0.75" max="1.35" step="0.03" value={features.upperLipThickness} onChange={(e) => updateFeature('upperLipThickness', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Grosor Labio Inferior: {Math.round(features.lowerLipThickness * 100)}%</span>
                          <input type="range" min="0.75" max="1.35" step="0.03" value={features.lowerLipThickness} onChange={(e) => updateFeature('lowerLipThickness', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                      </div>
                    </>
                  )}

                  {featureTab === 'rostro' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Forma del Rostro</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'oval', label: 'Ovalado Armonioso' },
                            { id: 'heart', label: 'Corazón' },
                            { id: 'diamond', label: 'Diamante' }
                          ].map((f) => (
                            <button
                              key={f.id}
                              onClick={() => updateFeature('faceShape', f.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                                features.faceShape === f.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Mejillas: {features.cheekWidth}</span>
                          <input type="range" min="-6" max="8" step="1" value={features.cheekWidth} onChange={(e) => updateFeature('cheekWidth', parseInt(e.target.value, 10))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Mandíbula: {features.jawDefinition}</span>
                          <input type="range" min="-6" max="8" step="1" value={features.jawDefinition} onChange={(e) => updateFeature('jawDefinition', parseInt(e.target.value, 10))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Mentón: {features.chinSize}</span>
                          <input type="range" min="-5" max="8" step="1" value={features.chinSize} onChange={(e) => updateFeature('chinSize', parseInt(e.target.value, 10))} className="w-full accent-[#FF168B]" />
                        </div>
                      </div>
                    </>
                  )}

                  {featureTab === 'cabello' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#FF168B] uppercase mb-2">Color de Cabello</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: 'Rubio Barbie', hex: '#F3D27A' },
                            { name: 'Platino Perla', hex: '#FAF0CA' },
                            { name: 'Castaño Miel', hex: '#8D5524' },
                            { name: 'Chocolate', hex: '#3B2314' },
                            { name: 'Negro Seda', hex: '#1A1116' },
                            { name: 'Pink Fantasía', hex: '#FF4FB8' }
                          ].map((hc) => (
                            <button
                              key={hc.hex}
                              onClick={() => updateFeature('hairColor', hc.hex)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                                features.hairColor === hc.hex ? 'border-[#FF168B] bg-pink-100/70' : 'bg-white border-pink-100'
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: hc.hex }} />
                              {hc.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#FF168B] uppercase mb-1.5">Largo</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'short', label: 'Corto' },
                              { id: 'medium', label: 'Medio' },
                              { id: 'long', label: 'Largo' }
                            ].map((hl) => (
                              <button
                                key={hl.id}
                                onClick={() => updateFeature('hairLength', hl.id)}
                                className={`py-2 rounded-xl text-xs font-bold border ${
                                  features.hairLength === hl.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                                }`}
                              >
                                {hl.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#FF168B] uppercase mb-1.5">Peinado</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'sleek', label: 'Liso' },
                              { id: 'waves', label: 'Ondas' },
                              { id: 'glamponytail', label: 'Coleta' }
                            ].map((hs) => (
                              <button
                                key={hs.id}
                                onClick={() => updateFeature('hairStyle', hs.id)}
                                className={`py-2 rounded-xl text-xs font-bold border ${
                                  features.hairStyle === hs.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-pink-200'
                                }`}
                              >
                                {hs.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="pt-1">
                        <button
                          onClick={() => updateFeature('hasBangs', !features.hasBangs)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
                            features.hasBangs
                              ? 'bg-[#FFE4F3] border-[#FF168B] text-[#FF168B]'
                              : 'bg-white border-pink-200 text-[#241126]'
                          }`}
                        >
                          <span>Flequillo Recto Abundante</span>
                          <span>{features.hasBangs ? 'Activado ✓' : 'Desactivado'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MODO 2: SIMULADOR DE MAQUILLAJE ADAPTATIVO */}
            {studioMode === 'maquillaje' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-gradient-to-r from-[#F3E8FF] to-[#FFE4F3]">
                  {[
                    { id: 'piel', label: 'Base y Piel' },
                    { id: 'ojos', label: 'Ojos' },
                    { id: 'labios', label: 'Labios' },
                    { id: 'extras', label: 'Complementos' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMakeupTab(t.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                        makeupTab === t.id
                          ? 'bg-[#A855F7] text-white shadow'
                          : 'text-[#241126]/75 hover:bg-white/70'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="bg-[#FAF5FF] rounded-2xl border border-[#A855F7]/25 p-5 min-h-[340px] space-y-4">
                  {makeupTab === 'piel' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Tono de Base</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { name: 'Porcelana', hex: '#FDE4D4' },
                            { name: 'Marfil', hex: '#F5C9B2' },
                            { name: 'Miel', hex: '#E3AD88' },
                            { name: 'Canela', hex: '#C7865E' },
                            { name: 'Caramelo', hex: '#9A5D3C' },
                            { name: 'Ébano', hex: '#653A24' }
                          ].map((st) => (
                            <button
                              key={st.hex}
                              onClick={() => updateMakeup('skinTone', st.hex)}
                              className={`flex flex-col items-center p-2 rounded-xl border ${
                                makeup.skinTone === st.hex ? 'border-[#FF168B] bg-white' : 'border-purple-100 bg-white/60'
                              }`}
                            >
                              <span className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: st.hex }} />
                              <span className="text-[10px] font-semibold mt-1">{st.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'matte', label: 'Acabado Mate' },
                          { id: 'satin', label: 'Satinado' },
                          { id: 'dewy', label: 'Glow Luminoso' }
                        ].map((sf) => (
                          <button
                            key={sf.id}
                            onClick={() => updateMakeup('skinFinish', sf.id)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                              makeup.skinFinish === sf.id ? 'bg-[#6426B8] text-white border-[#6426B8]' : 'bg-white border-purple-200'
                            }`}
                          >
                            {sf.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Rubor: {Math.round(makeup.blushOpacity * 100)}%</span>
                          <input type="range" min="0" max="0.85" step="0.05" value={makeup.blushOpacity} onChange={(e) => updateMakeup('blushOpacity', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Iluminador: {Math.round(makeup.highlightOpacity * 100)}%</span>
                          <input type="range" min="0" max="1" step="0.05" value={makeup.highlightOpacity} onChange={(e) => updateMakeup('highlightOpacity', parseFloat(e.target.value))} className="w-full accent-[#E8BD62]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block mb-1">Contorno: {Math.round(makeup.contourOpacity * 100)}%</span>
                          <input type="range" min="0" max="0.6" step="0.05" value={makeup.contourOpacity} onChange={(e) => updateMakeup('contourOpacity', parseFloat(e.target.value))} className="w-full accent-[#6426B8]" />
                        </div>
                      </div>
                    </>
                  )}

                  {makeupTab === 'ojos' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Estilo de Sombra</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: 'natural', label: 'Natural' },
                            { id: 'elegant', label: 'Elegante' },
                            { id: 'glam', label: 'Glam' },
                            { id: 'artistic', label: 'Artístico' }
                          ].map((es) => (
                            <button
                              key={es.id}
                              onClick={() => updateMakeup('eyeshadowStyle', es.id)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                                makeup.eyeshadowStyle === es.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-purple-200'
                              }`}
                            >
                              {es.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Paleta Cromática</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { name: 'Pink Glam', p: '#FF9AD5', s: '#FF168B' },
                            { name: 'Lila Eléctrico', p: '#D8B4FE', s: '#A855F7' },
                            { name: 'Oro & Coral', p: '#E8BD62', s: '#FF6B6B' },
                            { name: 'Magenta Pop', p: '#FF4FB8', s: '#D90087' },
                            { name: 'Violeta Noche', p: '#C084FC', s: '#6426B8' },
                            { name: 'Nude Suave', p: '#FDE4D4', s: '#D98A8C' }
                          ].map((pal) => (
                            <button
                              key={pal.name}
                              onClick={() => {
                                updateMakeup('eyeshadowPrimary', pal.p);
                                updateMakeup('eyeshadowSecondary', pal.s);
                              }}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-left ${
                                makeup.eyeshadowSecondary === pal.s ? 'border-[#FF168B] bg-white' : 'border-purple-100 bg-white/60'
                              }`}
                            >
                              <div className="flex -space-x-1">
                                <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: pal.p }} />
                                <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: pal.s }} />
                              </div>
                              <span className="text-[11px] font-bold">{pal.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs font-bold block mb-1">Intensidad: {Math.round(makeup.eyeshadowIntensity * 100)}%</span>
                          <input type="range" min="0" max="1" step="0.05" value={makeup.eyeshadowIntensity} onChange={(e) => updateMakeup('eyeshadowIntensity', parseFloat(e.target.value))} className="w-full accent-[#FF168B]" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Delineado</label>
                          <select
                            value={makeup.eyelinerStyle}
                            onChange={(e) => updateMakeup('eyelinerStyle', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-white font-semibold"
                          >
                            <option value="none">Sin delineado</option>
                            <option value="classic">Clásico</option>
                            <option value="winged">Cat Eye / Alado</option>
                            <option value="graphic">Gráfico Futurista</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {makeupTab === 'labios' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Tono de Labial</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { name: 'Rosa Barbie', hex: '#FF4FB8' },
                            { name: 'Fucsia Intenso', hex: '#FF168B' },
                            { name: 'Magenta Glam', hex: '#D90087' },
                            { name: 'Coral Vibrante', hex: '#FF6B6B' },
                            { name: 'Nude Seda', hex: '#E09F9D' },
                            { name: 'Ciruela Velvet', hex: '#6426B8' }
                          ].map((lip) => (
                            <button
                              key={lip.hex}
                              onClick={() => updateMakeup('lipColor', lip.hex)}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left ${
                                makeup.lipColor === lip.hex ? 'border-[#FF168B] bg-white' : 'border-purple-100 bg-white/60'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: lip.hex }} />
                              <span className="text-xs font-bold">{lip.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Acabado</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'matte', label: 'Mate Terciopelo' },
                            { id: 'satin', label: 'Satinado' },
                            { id: 'gloss', label: 'Brillo Cristal' }
                          ].map((lf) => (
                            <button
                              key={lf.id}
                              onClick={() => updateMakeup('lipFinish', lf.id)}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold border ${
                                makeup.lipFinish === lf.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-purple-200'
                              }`}
                            >
                              {lf.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {makeupTab === 'extras' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Pestañas Postizas</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'natural', label: 'Naturales' },
                            { id: 'doll', label: 'Muñeca Barbie' },
                            { id: 'dramatic', label: 'Volumen Glam' }
                          ].map((ls) => (
                            <button
                              key={ls.id}
                              onClick={() => updateMakeup('lashesStyle', ls.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                                makeup.lashesStyle === ls.id ? 'bg-[#FF168B] text-white border-[#FF168B]' : 'bg-white border-purple-200'
                              }`}
                            >
                              {ls.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Accesorios & Detalles</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'none', label: 'Ninguno' },
                            { id: 'pearls', label: 'Aretes Perla' },
                            { id: 'crystals', label: 'Cristales' },
                            { id: 'tiara', label: 'Tiara Dorada' }
                          ].map((acc) => (
                            <button
                              key={acc.id}
                              onClick={() => updateMakeup('accessory', acc.id)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                                makeup.accessory === acc.id ? 'bg-[#6426B8] text-white border-[#6426B8]' : 'bg-white border-purple-200'
                              }`}
                            >
                              {acc.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6426B8] uppercase mb-2">Iluminación de Estudio</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'pinkglam', label: 'Pink Glam' },
                            { id: 'purple', label: 'Lavanda Oro' },
                            { id: 'night', label: 'Noche Ciruela' }
                          ].map((bg) => (
                            <button
                              key={bg.id}
                              onClick={() => updateMakeup('bgTheme', bg.id)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                                makeup.bgTheme === bg.id ? 'bg-[#241126] text-[#E8BD62] border-[#241126]' : 'bg-white border-purple-200'
                              }`}
                            >
                              {bg.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* BOTONES DE CONVERSIÓN */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={onOpenRecommender}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#241126] text-[#E8BD62] font-bold text-xs sm:text-sm hover:bg-[#381B3B] transition shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-[#FF4FB8]" /> Descubre tu maquillaje ideal
              </button>
              <button
                onClick={() =>
                  onBookLook(
                    `Look personalizado en Vitalia Beauty Lab: Ojos ${features.eyeShape}, Labial ${makeup.lipColor} (${makeup.lipFinish}), Sombra ${makeup.eyeshadowStyle}.`
                  )
                }
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white font-bold text-xs sm:text-sm shadow-lg hover:opacity-95 transition"
              >
                Reservar este Look <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// ASISTENTE VIRTUAL VITA (INTELIGENCIA ARTIFICIAL APLICADA AL NEGOCIO)
// ============================================================================
const VitaAssistantWidget = ({ services, onSelectServiceForBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `¡Hola! Soy VITA, tu asesora virtual de belleza en Vitalia Beauty Experience. Estamos en ${STUDIO_ADDRESS}. Pregúntame sobre nuestros servicios, precios, estilos de maquillaje o cómo reservar tu cita.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  const generateVitaReply = (query) => {
    const q = query.toLowerCase();

    if (q.includes('ubicacion') || q.includes('ubicación') || q.includes('direccion') || q.includes('dirección') || q.includes('donde') || q.includes('dónde') || q.includes('barranquilla')) {
      return `Nuestro Estudio Principal está ubicado en ${STUDIO_ADDRESS}. ¡Te esperamos para brindarte una experiencia personalizada!`;
    }

    if (q.includes('reserva') || q.includes('cita') || q.includes('agendar') || q.includes('horario')) {
      return `Reservar es muy fácil: selecciona el servicio que te guste en nuestro catálogo o en "Mi Experiencia Vitalia", elige la fecha y consulta los horarios disponibles en tiempo real en la sección de Reservas. También puedes escribirnos por WhatsApp.`;
    }

    if (q.includes('fiesta') || q.includes('evento') || q.includes('gala') || q.includes('grado') || q.includes('boda')) {
      return 'Para un evento especial podemos ayudarte a combinar maquillaje, peinado y cuidado de uñas. Consulta el catálogo para ver los servicios actualmente disponibles y sus tarifas.';
    }

    if (q.includes('manicure') || q.includes('uñas') || q.includes('acrilic') || q.includes('gel')) {
      const manServices = services.filter((s) => s.category === 'Manicure' && s.active);
      const list = manServices.map((s) => `• ${s.name}: ${formatCOP(s.price)} (${s.duration} min)`).join('\n');
      return list ? `En Manicure contamos con:\n${list}\n¿Cuál te gustaría agendar?` : 'Estamos actualizando el catálogo de Manicure. Escríbenos para consultar disponibilidad.';
    }

    if (q.includes('pedicure') || q.includes('pies') || q.includes('spa')) {
      const pedServices = services.filter((s) => s.category === 'Pedicure' && s.active);
      const list = pedServices.map((s) => `• ${s.name}: ${formatCOP(s.price)}`).join('\n');
      return list ? `Nuestras experiencias de Pedicure son:\n${list}` : 'Estamos actualizando el catálogo de Pedicure. Escríbenos para consultar disponibilidad.';
    }

    if (q.includes('maquillaje') || q.includes('makeup') || q.includes('barbie')) {
      const list = services.filter((s) => s.category === 'Maquillaje' && s.active).map((s) => `• ${s.name}: ${formatCOP(s.price)}`).join('\n');
      return list ? `Estas son las opciones de maquillaje publicadas:\n${list}` : 'El catálogo de maquillaje aún está en configuración. Contáctanos para conocer las opciones disponibles.';
    }

    if (q.includes('cabello') || q.includes('corte') || q.includes('balayage') || q.includes('peinado') || q.includes('alisado') || q.includes('hidratacion')) {
      const list = services.filter((s) => s.category === 'Cabello' && s.active).map((s) => `• ${s.name}: ${formatCOP(s.price)}`).join('\n');
      return list ? `En Cabello tenemos estas opciones:\n${list}` : 'El catálogo de cabello aún está en configuración. Contáctanos para conocer las opciones disponibles.';
    }

    if (q.includes('precio') || q.includes('cuanto') || q.includes('cuánto') || q.includes('tarifa')) {
      const list = services.filter((s) => s.active).map((s) => `• ${s.name}: ${formatCOP(s.price)}`).join('\n');
      return list ? `Estas son las tarifas publicadas actualmente:\n${list}` : 'Aún no tenemos tarifas publicadas en el catálogo. Contáctanos para recibir información actualizada.';
    }

    return `En Vitalia Beauty Experience (${STUDIO_ADDRESS}) personalizamos cada servicio según tu esencia. Puedo ayudarte a elegir entre Manicure, Pedicure, Maquillaje o Cabello, o guiarte para probar tu look en Vitalia Beauty Lab. ¿Qué estilo buscas hoy?`;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    const history = [...messages, { role: 'user', text: userMsg }].slice(-10).map((m) => ({ role: m.role, content: m.text }));
    (async () => {
      let reply = '';
      let demo = true;
      if (supabase) {
        try {
          const { data, error } = await supabase.functions.invoke('vita-chat', { body: { mode: 'chat', messages: history } });
          if (!error && data && typeof data.reply === 'string' && !data.demo) { reply = data.reply; demo = false; }
        } catch { /* se usa el modo demostración */ }
      }
      if (demo) reply = generateVitaReply(userMsg) + '\n\n(Modo demostración: respuesta por reglas, sin conexión a IA.)';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    })();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#FF168B] via-[#D90087] to-[#6426B8] text-white shadow-2xl shadow-[#FF168B]/40 hover:scale-105 transition"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#E8BD62]" />
        </div>
        <div className="text-left">
          <span className="text-xs font-bold block leading-none">VITA IA</span>
          <span className="text-[10px] text-pink-100">Asesora de Belleza</span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl bg-white border border-[#FF4FB8]/40 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#241126] via-[#6426B8] to-[#FF168B] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#E8BD62]" />
              </div>
              <div>
                <span className="font-bold text-sm block leading-none">VITA Beauty Assistant</span>
                <span className="text-[10px] text-pink-200">Asistente de belleza • En línea</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/15">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[320px] bg-[#FFF9FD]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white shadow-sm'
                      : 'bg-white border border-pink-100 text-[#241126] shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[11px] text-[#FF168B] font-semibold animate-pulse">VITA está escribiendo...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preguntas rápidas */}
          <div className="px-3 py-2 bg-white border-t border-pink-100 flex gap-1.5 overflow-x-auto">
            {['¿Dónde están?', 'Look para fiesta', 'Precios maquillaje'].map((chip) => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-pink-50 text-[#FF168B] text-[10px] font-bold hover:bg-pink-100"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-pink-100 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a VITA..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-[#FF168B]"
            />
            <button type="submit" className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white shadow">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// ============================================================================
// APLICACIÓN PRINCIPAL VITALIA BEAUTY EXPERIENCE
// ============================================================================
export default function App() {
  const [services, setServices] = useState(() => (isSupabaseConfigured ? INITIAL_SERVICES : localLoad('vitalia_services', INITIAL_SERVICES)));
  const [bookings, setBookings] = useState(() => (isSupabaseConfigured ? [] : localLoad('vitalia_bookings', [])));
  useEffect(() => { if (!isSupabaseConfigured) { localSave('vitalia_services', services); localSave('vitalia_bookings', bookings); } }, [services, bookings]);
  const [remoteOccupiedSlots, setRemoteOccupiedSlots] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMood, setActiveMood] = useState('Elegante');
  const [galleryFilter, setGalleryFilter] = useState('Todos');
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modales de detalle y recomendador
  const [detailService, setDetailService] = useState(null);
  const [recommenderOpen, setRecommenderOpen] = useState(false);
  const [recAnswers, setRecAnswers] = useState({ occasion: 'Fiesta o Gala', style: 'Glam y Sofisticado', focus: 'Integral (Rostro, Cabello y Uñas)' });

  // Carrito "Mi Experiencia Vitalia"
  const [experienceCart, setExperienceCart] = useState([]);

  // Formulario de reservas
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    email: '',
    phone: '',
    serviceId: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '',
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Panel Administrativo
  const [adminViewOpen, setAdminViewOpen] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' | 'reservas' | 'servicios'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [editingService, setEditingService] = useState(null);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    category: 'Manicure',
    description: '',
    duration: 60,
    price: 0,
    image: ''
  });

  // Notificaciones Toast
  const [toast, setToast] = useState(null);
  const notify = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3800 ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    if (!supabase || !bookingForm.date) { setRemoteOccupiedSlots([]); return; }
    let alive = true;
    const refresh = () => supabase.rpc('get_booked_slots', { requested_date: bookingForm.date }).then(({ data, error }) => {
      if (alive && !error && data) setRemoteOccupiedSlots(data.map((row) => row.booking_time));
    });
    refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => { alive = false; window.clearInterval(interval); };
  }, [bookingForm.date]);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const loadData = async () => {
      const [{ data: serviceRows }, { data: bookingRows }, { data: authData }] = await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.auth.getUser()
      ]);
      if (!alive) return;
      if (serviceRows && serviceRows.length > 0) setServices(serviceRows.map((r) => ({ id:r.id, category:r.category, name:r.name, description:r.description || '', duration:r.duration_minutes, price:r.price_cop, active:r.active, moods:r.moods || [], image:r.image_url || '' })));
      if (bookingRows) setBookings(bookingRows.map((r) => ({ id:r.id, clientName:r.client_name, email:r.email, phone:r.phone, serviceId:r.service_id, serviceName:r.service_name, date:r.booking_date, time:r.booking_time, notes:r.notes || '', status:r.status, createdAt:r.created_at })));
      if (authData.user?.app_metadata?.role === 'admin') setAdminSession({ email:authData.user.email, role:'admin', token:'Sesión protegida por Supabase' });
    };
    loadData();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!s.active) return false;
      const matchesCat = selectedCategory === 'Todos' || s.category === selectedCategory;
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [services, selectedCategory, searchTerm]);

  const occupiedSlots = useMemo(() => [...new Set([...remoteOccupiedSlots, ...bookings.filter((b) => b.date === bookingForm.date && b.status !== 'Cancelada').map((b) => b.time)])], [bookings, bookingForm.date, remoteOccupiedSlots]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const addToExperience = (srv) => {
    if (experienceCart.some((item) => item.id === srv.id)) {
      notify('Este servicio ya está en Mi Experiencia Vitalia.', 'info');
      return;
    }
    setExperienceCart((prev) => [...prev, srv]);
    notify(`"${srv.name}" añadido a Mi Experiencia Vitalia.`, 'success');
  };

  const removeFromExperience = (id) => {
    setExperienceCart((prev) => prev.filter((item) => item.id !== id));
  };

  const continueCartToBooking = () => {
    if (experienceCart.length === 0) return;
    const first = experienceCart[0];
    const summaryNames = experienceCart.map((s) => s.name).join(' + ');
    setBookingForm((prev) => ({
      ...prev,
      serviceId: first.id,
      notes: `Paquete Mi Experiencia Vitalia: ${summaryNames}`
    }));
    scrollToSection('reservas');
    notify('Selección cargada en el formulario de citas.', 'success');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.clientName.trim() || !bookingForm.email.trim() || !bookingForm.phone.trim()) {
      notify('Por favor completa nombre, correo y teléfono.', 'error');
      return;
    }
    if (!bookingForm.date || !bookingForm.time) {
      notify('Selecciona una fecha y una hora disponible.', 'error');
      return;
    }
    if (occupiedSlots.includes(bookingForm.time)) {
      notify('Ese horario ya fue reservado. Elige otro disponible.', 'error');
      return;
    }

    const chosenService = services.find((s) => s.id === bookingForm.serviceId);
    if (!chosenService) { notify('Este servicio aún no está configurado. Contacta al salón.', 'error'); return; }
    const newBooking = {
      id: `RES-${Math.floor(2100 + Math.random() * 7800)}`,
      clientName: bookingForm.clientName.trim(),
      email: bookingForm.email.trim(),
      phone: bookingForm.phone.trim(),
      serviceId: chosenService.id,
      serviceName: chosenService.name,
      date: bookingForm.date,
      time: bookingForm.time,
      notes: bookingForm.notes.trim(),
      status: 'Pendiente',
      createdAt: new Date().toISOString()
    };

    if (!supabase) {
      setBookings((prev) => [newBooking, ...prev]);
      setBookingSuccess(newBooking);
      setBookingForm((prev) => ({ ...prev, time: '', notes: '' }));
      notify(`¡Solicitud ${newBooking.id} registrada! (modo demostración local)`, 'success');
      try { window.open(buildBookingWhatsApp(newBooking), '_blank', 'noopener'); } catch { /* botón de respaldo */ }
      return;
    }
    const { error } = await supabase.from('bookings').insert({ client_name:newBooking.clientName, email:newBooking.email, phone:newBooking.phone, service_id:chosenService.id, service_name:chosenService.name, booking_date:newBooking.date, booking_time:newBooking.time, notes:newBooking.notes, status:'Pendiente' });
    if (error) { notify(error.code === '23505' ? 'Ese horario acaba de ser reservado. Elige otro.' : 'No se pudo registrar la reserva. Intenta nuevamente.', 'error'); return; }
    setBookings((prev) => [newBooking, ...prev]);
    setBookingSuccess(newBooking);
    try { window.open(buildBookingWhatsApp(newBooking), '_blank', 'noopener'); } catch { /* si el navegador bloquea la ventana, queda el botón */ }
    setBookingForm((prev) => ({ ...prev, time: '', notes: '' }));
    notify(`¡Solicitud ${newBooking.id} registrada exitosamente!`, 'success');
  };

  // Autenticación real mediante Supabase Auth. No existen credenciales maestras en el frontend.
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!supabase) { notify('Configura Supabase para habilitar el acceso administrativo.', 'error'); return; }
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginForm.email.trim(), password: loginForm.password });
   if (error) { notify(error.message, 'error'); return; }
   if (!data.user || data.user.app_metadata?.role !== 'admin') { await supabase.auth.signOut(); notify('La cuenta no tiene permisos administrativos.', 'error'); return; }
    setAdminSession({ email: data.user.email, role: 'admin', token: 'Sesión protegida por Supabase' });
    const [{ data: adminServices }, { data: adminBookings }] = await Promise.all([
      supabase.from('services').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false })
    ]);
    if (adminServices && adminServices.length > 0) setServices(adminServices.map((r) => ({ id:r.id, category:r.category, name:r.name, description:r.description || '', duration:r.duration_minutes, price:r.price_cop, active:r.active, moods:r.moods || [], image:r.image_url || '' })));
    if (adminBookings) setBookings(adminBookings.map((r) => ({ id:r.id, clientName:r.client_name, email:r.email, phone:r.phone, serviceId:r.service_id, serviceName:r.service_name, date:r.booking_date, time:r.booking_time, notes:r.notes || '', status:r.status, createdAt:r.created_at })));
    notify('Acceso administrativo autorizado.', 'success');
  };

  const updateBookingStatus = async (id, status) => {
    if (!supabase) { setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b))); notify(`Reserva ${id} marcada como ${status}.`, 'success'); return; }
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) { notify('No se pudo actualizar la reserva.', 'error'); return; }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    notify(`Reserva ${id} marcada como ${status}.`, 'success');
  };

  const deleteBooking = async (id) => {
    if (!supabase) { setBookings((prev) => prev.filter((b) => b.id !== id)); notify(`Registro ${id} eliminado.`, 'info'); return; }
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) { notify('No se pudo eliminar la reserva.', 'error'); return; }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    notify(`Registro ${id} eliminado.`, 'info');
  };

  const handleSaveEditedService = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    if (!supabase) {
      setServices((prev) => prev.map((s) => (s.id === editingService.id ? { ...editingService, price: Number(editingService.price), duration: Number(editingService.duration) } : s)));
      setEditingService(null);
      notify('Servicio actualizado.', 'success');
      return;
    }
    const { error } = await supabase.from('services').update({ name:editingService.name, price_cop:Number(editingService.price), duration_minutes:Number(editingService.duration), category:editingService.category, description:editingService.description, active:editingService.active, image_url:editingService.image }).eq('id', editingService.id);
    if (error) { notify('No se pudo guardar el servicio.', 'error'); return; }
    setServices((prev) => prev.map((s) => (s.id === editingService.id ? editingService : s)));
    setEditingService(null);
    notify('Servicio actualizado en el catálogo en tiempo real.', 'success');
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('¿Eliminar este servicio del catálogo?')) return;
    if (supabase) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) { notify('No se pudo eliminar el servicio.', 'error'); return; }
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    notify('Servicio eliminado.', 'info');
  };

  const handleSeedCatalog = async () => {
    if (!supabase) return;
    const rows = INITIAL_SERVICES.map((s) => ({ name: s.name, category: s.category, description: s.description, duration_minutes: s.duration, price_cop: s.price, active: true, image_url: s.image, moods: s.moods }));
    const { error } = await supabase.from('services').insert(rows);
    if (error) { notify('No se pudo cargar el catálogo inicial.', 'error'); return; }
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (data) setServices(data.map((r) => ({ id:r.id, category:r.category, name:r.name, description:r.description || '', duration:r.duration_minutes, price:r.price_cop, active:r.active, moods:r.moods || [], image:r.image_url || '' })));
    notify('Catálogo inicial (28 servicios) cargado en Supabase.', 'success');
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceForm.name.trim() || Number(newServiceForm.price) <= 0 || Number(newServiceForm.duration) <= 0) { notify('Ingresa nombre, tarifa y duración válidos.', 'error'); return; }
    const created = {
      id: `srv-${Date.now()}`,
      ...newServiceForm,
      duration: Number(newServiceForm.duration),
      price: Number(newServiceForm.price),
      active: true,
      moods: ['Elegante', 'Creativa']
    };
    if (!supabase) {
      setServices((prev) => [{ ...created, image: created.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80' }, ...prev]);
      setNewServiceForm({ name: '', category: 'Manicure', description: '', duration: 60, price: 0, image: '' });
      notify('Nuevo servicio creado y publicado.', 'success');
      return;
    }
    const { data: saved, error } = await supabase.from('services').insert({ name:created.name, category:created.category, description:created.description, duration_minutes:created.duration, price_cop:created.price, active:true, image_url:created.image, moods:created.moods }).select().single();
    if (error) { notify('No se pudo crear el servicio.', 'error'); return; }
    created.id = saved.id;
    setServices((prev) => [created, ...prev]);
    setNewServiceForm({
      name: '',
      category: 'Manicure',
      description: '',
      duration: 60,
      price: 0,
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
    });
    notify('Nuevo servicio creado y publicado.', 'success');
  };

  // Recomendaciones dinámicas del recomendador IA
  const recommendedPackage = useMemo(() => {
    const activeList = services.filter((s) => s.active);
    const byCat = (cat) => activeList.find((s) => s.category === cat) || activeList[0];
    if (recAnswers.occasion === 'Fiesta o Gala') {
      return [
        activeList.find((s) => s.id === 'srv-15') || byCat('Maquillaje'),
        activeList.find((s) => s.id === 'srv-28') || byCat('Cabello'),
        activeList.find((s) => s.id === 'srv-2') || byCat('Manicure')
      ];
    }
    if (recAnswers.occasion === 'Cambio de Look') {
      return [
        activeList.find((s) => s.id === 'srv-22') || byCat('Cabello'),
        activeList.find((s) => s.id === 'srv-20') || byCat('Cabello'),
        activeList.find((s) => s.id === 'srv-5') || byCat('Manicure')
      ];
    }
    return [
      activeList.find((s) => s.id === 'srv-13') || byCat('Maquillaje'),
      activeList.find((s) => s.id === 'srv-24') || byCat('Cabello'),
      activeList.find((s) => s.id === 'srv-11') || byCat('Pedicure')
    ];
  }, [services, recAnswers]);

  const totalExperiencePrice = experienceCart.reduce((acc, item) => acc + item.price, 0);
  const totalExperienceDuration = experienceCart.reduce((acc, item) => acc + item.duration, 0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-white text-[#241126] selection:bg-[#FF168B] selection:text-white">
      {/* NOTIFICACIÓN FLOTANTE */}
      {toast && (
        <div className="fixed top-24 right-4 z-[60] bg-[#241126] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#FF4FB8]/50 flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#E8BD62]" />
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ENCABEZADO ACCESIBLE DURANTE TODA LA NAVEGACIÓN */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#FF4FB8]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#inicio" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}>
            <VitaliaLogo size="md" />
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wide">
            <button onClick={() => scrollToSection('inicio')} className="hover:text-[#FF168B] transition">Inicio</button>
            <button onClick={() => scrollToSection('esencia')} className="hover:text-[#FF168B] transition">Nuestra Esencia</button>
            <button onClick={() => scrollToSection('beauty-lab')} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF168B]/10 to-[#A855F7]/10 text-[#FF168B] flex items-center gap-1 hover:from-[#FF168B] hover:to-[#A855F7] hover:text-white transition">
              <Sparkles className="w-3.5 h-3.5 text-[#E8BD62]" /> Beauty Lab
            </button>
            <button onClick={() => scrollToSection('catalogo')} className="hover:text-[#FF168B] transition">Catálogo</button>
            <button onClick={() => scrollToSection('mood')} className="hover:text-[#FF168B] transition">Beauty Mood</button>
            <button onClick={() => scrollToSection('galeria')} className="hover:text-[#FF168B] transition">Inspiración</button>
            <button onClick={() => scrollToSection('reservas')} className="hover:text-[#FF168B] transition">Reservas</button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => scrollToSection('mi-experiencia')}
              className="relative p-2.5 rounded-full bg-[#FFF0F9] text-[#FF168B] hover:bg-[#FFE0F2] transition"
              title="Mi Experiencia Vitalia"
            >
              <ShoppingBag className="w-4 h-4" />
              {experienceCart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6426B8] text-white text-[10px] font-bold flex items-center justify-center">
                  {experienceCart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminViewOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#6426B8]/30 text-[#6426B8] text-xs font-bold hover:bg-[#6426B8] hover:text-white transition"
            >
              <Lock className="w-3 h-3" /> Admin
            </button>

            <button
              onClick={() => scrollToSection('reservas')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF168B] via-[#FF4FB8] to-[#A855F7] text-white text-xs font-bold shadow-lg shadow-[#FF168B]/30 hover:scale-105 transition"
            >
              Reservar
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-pink-200 text-[#241126]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-pink-100 px-4 py-4 space-y-2 text-sm font-bold">
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'esencia', label: 'Nuestra Esencia' },
              { id: 'beauty-lab', label: 'Vitalia Beauty Lab (Barbie)' },
              { id: 'catalogo', label: 'Catálogo de Servicios' },
              { id: 'mood', label: 'Beauty Mood' },
              { id: 'galeria', label: 'Transforma tu Estilo' },
              { id: 'mi-experiencia', label: `Mi Experiencia (${experienceCart.length})` },
              { id: 'reservas', label: 'Reservas y Ubicación' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left py-2 px-3 rounded-xl hover:bg-pink-50"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); setAdminViewOpen(true); }}
              className="block w-full text-left py-2 px-3 rounded-xl text-[#6426B8] bg-purple-50"
            >
              Panel Administrativo
            </button>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* A. INICIO – LANDING PAGE PINK GLAM FUTURISTA */}
      {/* ==================================================================== */}
      <section id="inicio" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-[#FFEAF6] to-[#EAD7FF] overflow-hidden">
        {/* Destellos luminosos */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF4FB8]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#FF168B]/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF168B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6426B8]">
                Salón de Belleza Integral • Barranquilla
              </span>
            </div>

            <h1
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-4xl sm:text-6xl font-bold leading-[1.1] text-[#241126]"
            >
              Tu esencia, tu estilo,{' '}
              <span className="bg-gradient-to-r from-[#FF168B] via-[#D90087] to-[#6426B8] bg-clip-text text-transparent italic">
                tu mejor versión.
              </span>
            </h1>

            <p className="text-[#241126]/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Descubre un universo de alta cosmética, estilismo personalizado y tecnología interactiva. Diseña tu propio look en nuestro estudio virtual y hazlo realidad en <strong>{STUDIO_ADDRESS}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start pt-2">
              <button
                onClick={() => scrollToSection('beauty-lab')}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-[#FF168B] via-[#FF4FB8] to-[#A855F7] text-white font-bold text-sm shadow-xl shadow-[#FF168B]/35 hover:scale-105 transition"
              >
                <Wand2 className="w-4 h-4 text-[#E8BD62]" /> Descubre tu estilo
              </button>
              <button
                onClick={() => scrollToSection('reservas')}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#241126] text-white font-bold text-sm hover:bg-[#3A1B3D] transition shadow-lg"
              >
                <Calendar className="w-4 h-4 text-[#FF4FB8]" /> Reserva tu experiencia
              </button>
              <button
                onClick={() => scrollToSection('catalogo')}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/90 border border-[#FF4FB8]/40 text-[#FF168B] font-bold text-sm hover:bg-pink-50 transition"
              >
                Ver Catálogo
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-3 rounded-[2.8rem] bg-gradient-to-tr from-[#FF168B] via-[#E8BD62] to-[#A855F7] opacity-45 blur-xl" />
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85"
                  alt="Vitalia Beauty Experience Editorial"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241126]/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#E8BD62] font-bold">Estudio Principal</span>
                      <p className="text-xs font-semibold">{STUDIO_ADDRESS}</p>
                    </div>
                    <button
                      onClick={() => scrollToSection('beauty-lab')}
                      className="px-3 py-1.5 rounded-full bg-[#FF168B] text-[11px] font-bold"
                    >
                      Probar Lab →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* B. NUESTRA ESENCIA, HISTORIA, MISIÓN, VISIÓN Y PILARES */}
      {/* ==================================================================== */}
      <section id="esencia" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF168B]">Identidad y Propósito</span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl sm:text-5xl font-bold text-[#241126]">
              Nuestra Esencia
            </h2>
            <p className="text-[#241126]/75 text-sm sm:text-base leading-relaxed">
              Vitalia Beauty Experience nace en <strong>{STUDIO_ADDRESS}</strong> con el propósito de ofrecer servicios integrales de belleza, cuidado personal y bienestar en un ambiente moderno, cómodo y acogedor para mujeres y hombres.
            </p>
          </div>

          {/* Misión y Visión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-3xl bg-gradient-to-br from-[#FFF0F9] to-white border border-[#FF4FB8]/30 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FF168B] text-white text-[10px] font-bold uppercase tracking-wider mb-3">
                Nuestra Misión
              </span>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold mb-2">
                Realzar tu belleza auténtica
              </h3>
              <p className="text-xs sm:text-sm text-[#241126]/75 leading-relaxed">
                Brindar experiencias integrales de belleza y bienestar mediante profesionales altamente capacitados, productos de primera calidad e innovación digital que permita a cada cliente sentirse seguro, renovado y fiel a su estilo.
              </p>
            </div>
            <div className="p-7 rounded-3xl bg-gradient-to-br from-[#F5E8FF] to-white border border-[#A855F7]/30 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-[#6426B8] text-white text-[10px] font-bold uppercase tracking-wider mb-3">
                Nuestra Visión
              </span>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold mb-2">
                Referente de innovación y glamour
              </h3>
              <p className="text-xs sm:text-sm text-[#241126]/75 leading-relaxed">
                Consolidarnos como el salón de belleza integral más innovador y memorable de Barranquilla, fusionando arte cosmético, atención cercana y herramientas tecnológicas personalizadas.
              </p>
            </div>
          </div>

          {/* 5 Pilares: Por qué elegir Vitalia */}
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-center mb-6">
              ¿Por qué elegir Vitalia?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: Heart, title: 'Atención Personalizada', desc: 'Diagnóstico individualizado para resaltar tus rasgos únicos.' },
                { icon: Award, title: 'Profesionales Capacitados', desc: 'Especialistas certificados en color, uñas, cabello y maquillaje.' },
                { icon: Shield, title: 'Productos de Calidad', desc: 'Fórmulas dermatológicas y cosméticas de alto rendimiento.' },
                { icon: Sparkles, title: 'Innovación en Belleza', desc: 'Simulador virtual Beauty Lab y asesoría inteligente con VITA.' },
                { icon: Star, title: 'Experiencias a Medida', desc: 'Rituales diseñados para cada ocasión, estilo y personalidad.' }
              ].map((pilar, i) => {
                const IconComp = pilar.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-3xl bg-white border border-[#FF4FB8]/25 hover:border-[#FF168B] hover:shadow-xl hover:shadow-[#FF168B]/10 transition group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF168B] to-[#A855F7] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">{pilar.title}</h4>
                    <p className="text-xs text-[#241126]/70 leading-relaxed">{pilar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FUNCIONALIDAD ESTRELLA: VITALIA BEAUTY LAB + BARBIE PERSONALIZABLE */}
      {/* ==================================================================== */}
      <VitaliaBeautyLab
        onOpenRecommender={() => setRecommenderOpen(true)}
        onBookLook={(notes) => {
          setBookingForm((prev) => ({ ...prev, serviceId: services.find((service) => service.category === 'Maquillaje' && service.active)?.id || '', notes }));
          scrollToSection('reservas');
        }}
        notify={notify}
      />

      {/* ==================================================================== */}
      {/* C. CATÁLOGO INTERACTIVO DE SERVICIOS (4 CATEGORÍAS) */}
      {/* ==================================================================== */}
      <section id="catalogo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF168B]">Carta de Experiencias</span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl sm:text-5xl font-bold mt-1">
              Catálogo de Servicios
            </h2>
            <p className="text-xs text-[#241126]/65 mt-2">
              Servicios, tarifas y duraciones vigentes, administrados directamente por Vitalia.
            </p>
          </div>

          {/* Buscador y Filtros */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {['Todos', 'Manicure', 'Pedicure', 'Maquillaje', 'Cabello'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white shadow-md'
                      : 'bg-[#FFF0F9] text-[#241126] hover:bg-[#FFE0F2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#FF168B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar servicio..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#FF4FB8]/30 text-xs focus:outline-none focus:border-[#FF168B]"
              />
            </div>
          </div>

          {/* Tarjetas de Servicios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length === 0 && <p className="sm:col-span-2 lg:col-span-3 text-center rounded-3xl border border-dashed border-pink-200 bg-pink-50/50 p-10 text-sm text-[#241126]/65">El catálogo se está configurando. Los servicios y tarifas aparecerán aquí cuando el equipo de Vitalia los publique desde el panel administrativo.</p>}
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="group bg-white rounded-3xl border border-[#FF4FB8]/25 hover:border-[#FF168B] shadow-sm hover:shadow-xl hover:shadow-[#FF168B]/10 p-5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-pink-50">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#241126]/85 text-[#E8BD62] text-[10px] font-bold uppercase">
                      {srv.category}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[#241126] text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FF168B]" /> {srv.duration} min
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg font-bold text-[#241126]">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-[#241126]/70 mt-1.5 leading-relaxed">{srv.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-pink-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-[#241126]/50 block font-bold">Tarifa</span>
                      <span className="font-bold text-base text-[#FF168B]">{formatCOP(srv.price)}</span>
                    </div>
                    <button
                      onClick={() => addToExperience(srv)}
                      className="px-3 py-1.5 rounded-xl bg-[#F5E8FF] text-[#6426B8] text-[11px] font-bold hover:bg-[#E9D5FF] transition"
                    >
                      + Mi Experiencia
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDetailService(srv)}
                      className="py-2.5 px-3 rounded-xl border border-[#FF4FB8]/40 text-[#241126] text-xs font-bold hover:bg-pink-50 transition"
                    >
                      Conocer servicio
                    </button>
                    <button
                      onClick={() => {
                        setBookingForm((prev) => ({ ...prev, serviceId: srv.id }));
                        scrollToSection('reservas');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white text-xs font-bold shadow hover:opacity-95 transition"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXPERIENCIA A: BEAUTY MOOD */}
      {/* ==================================================================== */}
      <section id="mood" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#241126] via-[#461854] to-[#6426B8] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8BD62]">Experiencia Sensorial</span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl sm:text-5xl font-bold mt-1">
              Beauty Mood
            </h2>
            <p className="text-pink-100/80 text-sm mt-2">
              Elige cómo quieres sentirte o qué energía deseas proyectar hoy y descubre tu combinación ideal.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Elegante', 'Natural', 'Atrevida', 'Romántica', 'Sofisticada', 'Creativa'].map((mood) => (
              <button
                key={mood}
                onClick={() => setActiveMood(mood)}
                className={`px-6 py-3 rounded-full text-xs font-bold transition ${
                  activeMood === mood
                    ? 'bg-gradient-to-r from-[#FF168B] to-[#FF4FB8] text-white shadow-lg shadow-[#FF168B]/40 scale-105'
                    : 'bg-white/10 text-pink-100 hover:bg-white/20 border border-white/15'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services
              .filter((s) => s.active && s.moods?.includes(activeMood))
              .slice(0, 3)
              .map((srv) => (
                <div key={srv.id} className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#E8BD62] font-bold uppercase">{srv.category} • {srv.duration} min</span>
                    <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold mt-1">
                      {srv.name}
                    </h4>
                    <p className="text-xs text-pink-100/80 mt-2 leading-relaxed">{srv.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
                    <span className="font-bold text-base text-[#E8BD62]">{formatCOP(srv.price)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToExperience(srv)}
                        className="px-3 py-2 rounded-xl bg-white/15 text-white text-xs font-bold hover:bg-white/25"
                      >
                        + Añadir
                      </button>
                      <button
                        onClick={() => {
                          setBookingForm((prev) => ({ ...prev, serviceId: srv.id }));
                          scrollToSection('reservas');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#FF168B] text-white text-xs font-bold"
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXPERIENCIA B: TRANSFORMA TU ESTILO (GALERÍA DE INSPIRACIÓN) */}
      {/* ==================================================================== */}
      <section id="galeria" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FFF9FD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF168B]">Lookbook Editorial</span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl sm:text-5xl font-bold mt-1">
              Transforma tu Estilo
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Todos', 'Cortes de cabello', 'Cambios de color', 'Peinados', 'Diseños de uñas', 'Maquillajes'].map((f) => (
              <button
                key={f}
                onClick={() => setGalleryFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  galleryFilter === f
                    ? 'bg-[#241126] text-[#E8BD62]'
                    : 'bg-white border border-pink-200 text-[#241126] hover:border-[#FF168B]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.filter((g) => galleryFilter === 'Todos' || g.category === galleryFilter).map((item) => (
              <div key={item.id} className="group relative h-72 rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241126]/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#E8BD62] font-bold">{item.category}</span>
                    <h4 className="font-bold text-base">{item.title}</h4>
                  </div>
                  <button
                    onClick={() => scrollToSection('reservas')}
                    className="px-3 py-1.5 rounded-full bg-[#FF168B] text-[11px] font-bold"
                  >
                    Lo quiero
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXPERIENCIA C: MI EXPERIENCIA VITALIA (RESUMEN PERSONALIZADO) */}
      {/* ==================================================================== */}
      <section id="mi-experiencia" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-pink-100">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#FFF0F9] via-white to-[#F5E8FF] rounded-[2rem] border border-[#FF4FB8]/35 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF168B]">Tu Selección Personalizada</span>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl sm:text-3xl font-bold">
                Mi Experiencia Vitalia
              </h3>
            </div>
            <button
              onClick={() => setRecommenderOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#6426B8] text-white text-xs font-bold hover:opacity-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E8BD62]" /> Recomendador Inteligente IA
            </button>
          </div>

          {experienceCart.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#241126]/65">
              Aún no has agregado servicios. Explora el catálogo y pulsa <strong>"+ Mi Experiencia"</strong> para armar tu ritual.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {experienceCart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#FF168B]">{item.category}</span>
                      <p className="text-xs font-bold">{item.name}</p>
                      <span className="text-[11px] text-[#241126]/65">{item.duration} min • {formatCOP(item.price)}</span>
                    </div>
                    <button
                      onClick={() => removeFromExperience(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                      title="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-pink-200/60">
                <div className="text-xs">
                  <span>Duración total estimada: <strong>{totalExperienceDuration} min</strong></span>
                  <span className="mx-2">•</span>
                  <span>Inversión estimada: <strong className="text-base text-[#FF168B]">{formatCOP(totalExperiencePrice)}</strong></span>
                </div>
                <button
                  onClick={continueCartToBooking}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white text-xs font-bold shadow-lg"
                >
                  Continuar al Formulario de Citas <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXPERIENCIA D & E: TESTIMONIOS Y PREGUNTAS FRECUENTES */}
      {/* ==================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Testimonios */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF168B]">Inspiración de belleza</span>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mt-1">
                Opiniones de nuestras clientas
              </h3>
            </div>
            <div className="space-y-4">
              {TESTIMONIALS.length === 0 && <p className="text-sm text-[#241126]/65 rounded-2xl bg-[#FFF5FB] p-5">Este espacio se actualizará cuando Vitalia cuente con opiniones reales y autorizadas de sus clientas.</p>}
              {TESTIMONIALS.map((t) => (
                <div key={t.id} className="p-5 rounded-3xl bg-gradient-to-r from-[#FFF5FB] to-[#F8F0FF] border border-[#FF4FB8]/25">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1 text-[#E8BD62]">
                      {[...Array(t.rating)].map((_, idx) => <Star key={idx} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#6426B8]">{t.tag}</span>
                  </div>
                  <p className="text-xs sm:text-sm italic text-[#241126]/80">"{t.quote}"</p>
                  <div className="mt-3 text-xs font-bold text-[#241126]">{t.name} <span className="font-normal text-[#FF168B]">• {t.service}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas Frecuentes */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#6426B8]">Resolvemos tus dudas</span>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mt-1">
                Preguntas Frecuentes
              </h3>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-pink-200 overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold hover:bg-pink-50/60"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#FF168B] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-[#241126]/75 leading-relaxed border-t border-pink-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. SISTEMA DE RESERVAS, CONTACTO REAL Y UBICACIÓN OFICIAL */}
      {/* ==================================================================== */}
      <section id="reservas" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFEAF6] via-white to-[#EAD7FF] border-t border-pink-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tarjeta de Ubicación Oficial y WhatsApp */}
          <div className="lg:col-span-5 bg-[#241126] text-white rounded-[2rem] p-7 sm:p-8 shadow-2xl space-y-6">
            <VitaliaLogo light size="md" />
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold">
              Visítanos en nuestro Estudio Principal
            </h3>
            <p className="text-xs text-pink-100/80 leading-relaxed">
              Agenda tu cita online con verificación de disponibilidad en tiempo real o contáctanos directamente por nuestro canal de atención rápida.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15">
                <MapPin className="w-5 h-5 text-[#FF4FB8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#E8BD62] block">Dirección Oficial</span>
                  <span>{STUDIO_ADDRESS}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15">
                <Clock className="w-5 h-5 text-[#FF4FB8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#E8BD62] block">Horario de Atención</span>
                  <span>Lunes a Sábado: 9:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white text-[#241126] font-bold text-xs hover:bg-pink-50 transition"
              >
                <Compass className="w-4 h-4 text-[#FF168B]" /> Cómo llegar <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola Vitalia Beauty Experience (${STUDIO_ADDRESS}), me gustaría agendar una cita.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Directo
              </a>
            </div>
          </div>

          {/* Formulario de Solicitud de Citas */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-[#FF4FB8]/30">
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl sm:text-3xl font-bold mb-1">
              Reserva tu Experiencia
            </h2>
            <p className="text-xs text-[#FF168B] font-bold mb-6">Estudio Principal: {STUDIO_ADDRESS}</p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Laura Gómez"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-[#FF168B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-[#FF168B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Número de Contacto *</label>
                  <input
                    type="tel"
                    required
                    placeholder="300 000 0000"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-[#FF168B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Servicio Deseado *</label>
                  <select
                    value={bookingForm.serviceId}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:border-[#FF168B]"
                  >
                    {services.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.category}: {s.name} — {formatCOP(s.price)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value, time: '' })}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-[#FF168B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Hora Disponible *</label>
                  <select
                    required
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:border-[#FF168B]"
                  >
                    <option value="">Selecciona un horario...</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t} disabled={occupiedSlots.includes(t)}>
                        {t} {occupiedSlots.includes(t) ? '— (No disponible)' : '— Disponible'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Comentarios Adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Cuéntanos sobre el estilo o look que deseas..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 text-xs focus:outline-none focus:border-[#FF168B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF168B] via-[#D90087] to-[#6426B8] text-white font-bold text-sm shadow-xl shadow-[#FF168B]/30 hover:opacity-95 transition"
              >
                Confirmar Solicitud de Cita
              </button>

              {bookingSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> ¡Reserva Registrada ({bookingSuccess.id})!
                  </div>
                  <p>
                    <strong>{bookingSuccess.clientName}</strong>, hemos agendado tu solicitud para <strong>{bookingSuccess.serviceName}</strong> el día <strong>{bookingSuccess.date}</strong> a las <strong>{bookingSuccess.time}</strong> en <strong>{STUDIO_ADDRESS}</strong>.
                  </p>
                  <a href={buildBookingWhatsApp(bookingSuccess)} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition">
                    <MessageCircle className="w-4 h-4" /> Enviar mi reserva por WhatsApp
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PIE DE PÁGINA OFICIAL */}
      {/* ==================================================================== */}
      <footer className="bg-[#241126] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <VitaliaLogo light size="sm" />
          <div className="text-center space-y-1">
            <p className="font-bold text-[#E8BD62]">Estudio Principal: {STUDIO_ADDRESS}</p>
            <p className="text-pink-200/75">"Tu esencia, tu estilo, tu mejor versión"</p>
          </div>
          <div className="flex items-center gap-4">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4FB8] underline">
              Cómo llegar
            </a>
            <button onClick={() => setAdminViewOpen(true)} className="hover:text-[#E8BD62]">
              Acceso Administrativo
            </button>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* MODAL DETALLE DE SERVICIO ("CONOCER SERVICIO") */}
      {/* ==================================================================== */}
      {detailService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#FF4FB8]/30">
            <div className="relative h-56">
              <img src={detailService.image} alt={detailService.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setDetailService(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-[#241126]/80 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-pink-100 text-[#FF168B] text-[10px] font-bold uppercase">
                  {detailService.category}
                </span>
                <span className="text-xs font-bold text-[#6426B8]">{detailService.duration} minutos</span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold">
                {detailService.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#241126]/75 leading-relaxed">{detailService.description}</p>
              <div className="p-3 rounded-2xl bg-[#FFF5FB] text-xs flex items-center justify-between">
                <span>Tarifa del servicio:</span>
                <strong className="text-lg text-[#FF168B]">{formatCOP(detailService.price)}</strong>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    addToExperience(detailService);
                    setDetailService(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-[#6426B8] text-[#6426B8] font-bold text-xs"
                >
                  + Mi Experiencia
                </button>
                <button
                  onClick={() => {
                    setBookingForm((prev) => ({ ...prev, serviceId: detailService.id }));
                    setDetailService(null);
                    scrollToSection('reservas');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white font-bold text-xs"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL RECOMENDADOR INTELIGENTE DE SERVICIOS Y MAQUILLAJE */}
      {/* ==================================================================== */}
      {recommenderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#FF4FB8]/40 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF168B]" />
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold">
                  Recomendador Inteligente VITA IA
                </h3>
              </div>
              <button onClick={() => setRecommenderOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">1. ¿Cuál es la ocasión?</label>
                <select
                  value={recAnswers.occasion}
                  onChange={(e) => setRecAnswers({ ...recAnswers, occasion: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-pink-200 bg-white"
                >
                  <option value="Fiesta o Gala">Fiesta, Grado o Gala</option>
                  <option value="Cambio de Look">Renovación / Cambio de Look</option>
                  <option value="Cuidado y Relajación">Día de Cuidado y Bienestar</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">2. ¿Qué estilo prefieres?</label>
                <select
                  value={recAnswers.style}
                  onChange={(e) => setRecAnswers({ ...recAnswers, style: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-pink-200 bg-white"
                >
                  <option value="Glam y Sofisticado">Glam y Sofisticado</option>
                  <option value="Natural y Luminoso">Natural y Luminoso</option>
                  <option value="Creativo y Atrevido">Creativo y Atrevido</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF0F9] to-[#F5E8FF] border border-[#FF4FB8]/30 space-y-3">
              <span className="text-[11px] font-bold uppercase text-[#6426B8] block">
                Combinación Recomendada para ti (Catálogo Real):
              </span>
              {recommendedPackage.map((srv) => (
                <div key={srv.id} className="flex items-center justify-between bg-white p-3 rounded-xl text-xs shadow-sm">
                  <div>
                    <span className="font-bold block">{srv.name}</span>
                    <span className="text-[10px] text-[#FF168B]">{srv.category} • {srv.duration} min</span>
                  </div>
                  <span className="font-bold">{formatCOP(srv.price)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setExperienceCart(recommendedPackage);
                setRecommenderOpen(false);
                scrollToSection('mi-experiencia');
                notify('Paquete recomendado añadido a Mi Experiencia Vitalia.', 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF168B] to-[#A855F7] text-white font-bold text-xs shadow-lg"
            >
              Cargar Combinación en Mi Experiencia Vitalia
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. PANEL ADMINISTRATIVO PRIVADO CON AUTENTICACIÓN SHA-256 */}
      {/* ==================================================================== */}
      {adminViewOpen && (
        <div className="fixed inset-0 z-50 bg-[#241126]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#FF4FB8]/40">
            <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl sm:text-2xl font-bold">
                  Panel Administrativo — Vitalia
                </h3>
                <span className="text-[11px] text-[#FF168B] font-bold">{STUDIO_ADDRESS}</span>
              </div>
              <button onClick={() => setAdminViewOpen(false)} className="p-2 rounded-xl hover:bg-pink-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!adminSession ? (
              <form onSubmit={handleAdminLogin} className="max-w-md mx-auto space-y-4 py-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FFF0F9] border border-[#FF4FB8]/30 text-[#241126]">
                  <strong className="text-[#FF168B] block mb-1">Acceso privado</strong>
                  Inicia sesión con el usuario administrador creado en Supabase Auth. No hay credenciales predeterminadas.
                </div>
                <div>
                  <label className="font-bold block mb-1">Correo Administrativo</label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="correo administrativo"
                    className="w-full p-3 rounded-xl border border-pink-200"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full p-3 rounded-xl border border-pink-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF168B] to-[#6426B8] text-white font-bold shadow-lg"
                >
                  Iniciar Sesión Segura
                </button>
                {!isSupabaseConfigured && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <strong className="block text-amber-900">Modo demostración local (Supabase no configurado)</strong>
                    <p>Puedes abrir el panel para probar la gestión de reservas y servicios. Los cambios se guardan solo en este navegador y no hay autenticación real. Al configurar Supabase este acceso desaparece y se exige inicio de sesión real.</p>
                    <button type="button" onClick={() => { setAdminSession({ email: 'Modo demostración local', role: 'demo', token: 'sin Supabase · datos solo en este navegador' }); notify('Panel abierto en modo demostración local.', 'info'); }} className="w-full py-3 rounded-xl bg-[#241126] text-white font-bold">Entrar al panel (demostración)</button>
                  </div>
                )}
              </form>
            ) : (
              <div className="space-y-6 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#241126] text-white p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#E8BD62]" />
                    <span>Sesión verificada: <strong>{adminSession.email}</strong> · {adminSession.token}</span>
                  </div>
                  <button
                    onClick={async () => { await supabase?.auth.signOut(); setAdminSession(null); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Salir
                  </button>
                </div>

                {/* Navegación Admin */}
                <div className="flex gap-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'reservas', label: `Gestión de Reservas (${bookings.length})` },
                    { id: 'servicios', label: `Gestión de Servicios (${services.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`px-4 py-2 rounded-xl font-bold ${
                        adminTab === tab.id ? 'bg-[#FF168B] text-white' : 'bg-pink-50 text-[#241126]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: DASHBOARD */}
                {adminTab === 'dashboard' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                      <span className="text-[11px] font-bold text-[#FF168B]">Total Reservas</span>
                      <p className="text-2xl font-bold mt-1">{bookings.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-700">Pendientes</span>
                      <p className="text-2xl font-bold mt-1">{bookings.filter((b) => b.status === 'Pendiente').length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[11px] font-bold text-emerald-700">Confirmadas</span>
                      <p className="text-2xl font-bold mt-1">{bookings.filter((b) => b.status === 'Confirmada').length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                      <span className="text-[11px] font-bold text-[#6426B8]">Servicios Activos</span>
                      <p className="text-2xl font-bold mt-1">{services.filter((s) => s.active).length}</p>
                    </div>
                  </div>
                )}

                {/* TAB 2: GESTIÓN DE RESERVAS */}
                {adminTab === 'reservas' && (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#FF168B]">{b.id}</span>
                            <span className="font-bold">{b.clientName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' : b.status === 'Cancelada' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-[#241126]/75 mt-1">{b.serviceName} • {b.date} a las {b.time}</p>
                          <p className="text-[11px] text-[#241126]/60">{b.email} | Tel: {b.phone}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button onClick={() => updateBookingStatus(b.id, 'Confirmada')} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold">
                            Confirmar
                          </button>
                          <button onClick={() => updateBookingStatus(b.id, 'Cancelada')} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold">
                            Cancelar
                          </button>
                          <button onClick={() => deleteBooking(b.id)} className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: GESTIÓN DE SERVICIOS */}
                {adminTab === 'servicios' && (
                  <div className="space-y-6">
                    {/* Crear servicio */}
                    <form onSubmit={handleCreateService} className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                      <span className="font-bold text-[#6426B8] block">Crear Nuevo Servicio</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Nombre del servicio"
                          value={newServiceForm.name}
                          onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                          className="p-2 rounded-xl border bg-white"
                        />
                        <select
                          value={newServiceForm.category}
                          onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                          className="p-2 rounded-xl border bg-white"
                        >
                          <option value="Manicure">Manicure</option>
                          <option value="Pedicure">Pedicure</option>
                          <option value="Maquillaje">Maquillaje</option>
                          <option value="Cabello">Cabello</option>
                        </select>
                        <input
                          type="number"
                          required
                          placeholder="Precio COP"
                          value={newServiceForm.price}
                          onChange={(e) => setNewServiceForm({ ...newServiceForm, price: Number(e.target.value) })}
                          className="p-2 rounded-xl border bg-white"
                        />
                        <button type="submit" className="py-2 px-4 rounded-xl bg-[#6426B8] text-white font-bold">
                          + Crear Servicio
                        </button>
                      </div>
                    </form>

                    {/* Edición rápida */}
                    {editingService && (
                      <form onSubmit={handleSaveEditedService} className="p-4 rounded-2xl bg-pink-50 border border-[#FF168B] space-y-3">
                        <span className="font-bold text-[#FF168B] block">Editando: {editingService.name}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editingService.name}
                            onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                            className="p-2 rounded-xl border bg-white"
                          />
                          <input
                            type="number"
                            value={editingService.price}
                            onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                            className="p-2 rounded-xl border bg-white"
                          />
                          <input
                            type="number"
                            value={editingService.duration}
                            onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                            className="p-2 rounded-xl border bg-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="px-4 py-2 rounded-xl bg-[#FF168B] text-white font-bold">Guardar Cambios</button>
                          <button type="button" onClick={() => setEditingService(null)} className="px-4 py-2 rounded-xl bg-white border font-bold">Cancelar</button>
                        </div>
                      </form>
                    )}

                    {supabase && services.every((x) => String(x.id).startsWith('srv-')) && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
                        <span>Tu base de datos está vacía. Publica el catálogo inicial para habilitar reservas en línea.</span>
                        <button onClick={handleSeedCatalog} className="px-3 py-2 rounded-xl bg-[#241126] text-white font-bold">Cargar catálogo inicial (28)</button>
                      </div>
                    )}

                    {/* Listado de servicios */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {services.map((s) => (
                        <div key={s.id} className="p-3 rounded-xl border flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold">{s.name}</span>{' '}
                            <span className="text-[#FF168B] font-bold">({formatCOP(s.price)} • {s.duration} min)</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setEditingService(s)}
                              className="px-2.5 py-1 rounded-lg bg-pink-100 text-[#FF168B] font-bold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={async () => { if (!supabase) { setServices((prev) => prev.map((item) => (item.id === s.id ? { ...item, active: !item.active } : item))); return; } const { error } = await supabase.from('services').update({ active: !s.active }).eq('id', s.id); if (error) { notify('No se pudo cambiar el estado.', 'error'); return; } setServices((prev) => prev.map((item) => (item.id === s.id ? { ...item, active: !item.active } : item))); }}
                              className={`px-2.5 py-1 rounded-lg font-bold ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200'}`}
                            >
                              {s.active ? 'Activo' : 'Inactivo'}
                            </button>
                            <button onClick={() => handleDeleteService(s.id)} className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-bold">Eliminar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASISTENTE VIRTUAL FLOTANTE VITA */}
      <VitaAssistantWidget
        services={services}
        onSelectServiceForBooking={(id) => {
          setBookingForm((prev) => ({ ...prev, serviceId: id }));
          scrollToSection('reservas');
        }}
      />
    </div>
  );
}
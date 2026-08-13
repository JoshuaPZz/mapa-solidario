import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const phoneRegex = /(?:\+?57)?\s*(?:3\d{2})[\s-]?\d{3}[\s-]?\d{4}/g;
const instaUrlRegex = /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)/g;
const instaHandleRegex = /@([a-zA-Z0-9_.-]+)/g;
const waRegex = /https?:\/\/(?:chat\.|api\.|www\.)?whatsapp\.com\/[^\s]+|https?:\/\/wa\.me\/[^\s]+/gi;

export async function GET() {
  const { data, error } = await supabase.from('puntos_ayuda').select('*')
  const puntos = data as any[] | null
  
  if (error || !puntos) {
    return NextResponse.json({ error: error?.message || 'Error fetching data' }, { status: 500 })
  }

  let updatedCount = 0;
  
  for (const punto of puntos) {
    let changed = false;
    let newContacto = punto.contacto || '';
    let newInstagram = punto.instagram || '';
    let newQueRecibe = punto.que_recibe || '';
    let newNotas = punto.notas || '';
    let newLinkInscripcion = punto.link_inscripcion || '';

    // Remove colombiateamo.com links
    if (newLinkInscripcion.includes('colombiateamo.com')) {
      newLinkInscripcion = '';
    }

    const extractData = (text: string) => {
      if (!text) return text;
      let extracted = text;

      const urls = text.match(instaUrlRegex);
      if (urls) {
        urls.forEach(url => {
          if (!newInstagram) newInstagram = url;
          extracted = extracted.replace(url, '');
        });
      }

      const handles = extracted.match(instaHandleRegex);
      if (handles) {
        handles.forEach(handle => {
          if (handle.includes('@') && extracted.includes(handle + '.')) return;
          if (!newInstagram) newInstagram = `https://instagram.com/${handle.replace('@', '')}`;
          extracted = extracted.replace(handle, '');
        });
      }

      const phones = extracted.match(phoneRegex);
      if (phones) {
        phones.forEach(phone => {
          if (!newContacto.includes(phone.trim())) {
            newContacto += (newContacto ? ' - ' : '') + phone.trim();
          }
          extracted = extracted.replace(phone, '');
        });
      }

      // Extract WhatsApp links
      const waLinks = extracted.match(waRegex);
      if (waLinks) {
        waLinks.forEach(link => {
          if (!newLinkInscripcion.includes(link)) {
            newLinkInscripcion = link; // Store as the primary link
          }
          extracted = extracted.replace(link, '');
        });
      }

      extracted = extracted.replace(/(?:Contacto|WhatsApp|Celular|Teléfono|Instagram|IG|Wa|Wpp|Cel|Link|Inscripción):?\s*(?:-)?\s*(?=\n|$)/gi, '');
      
      return extracted.trim();
    }

    const prevQueRecibe = newQueRecibe;
    newQueRecibe = extractData(newQueRecibe);
    
    const prevNotas = newNotas;
    newNotas = extractData(newNotas);
    
    if (newContacto !== (punto.contacto || '')) changed = true;
    if (newInstagram !== (punto.instagram || '')) changed = true;
    if (newQueRecibe !== prevQueRecibe) changed = true;
    if (newNotas !== prevNotas) changed = true;
    if (newLinkInscripcion !== (punto.link_inscripcion || '')) changed = true;

    if (changed) {
      await (supabase.from('puntos_ayuda') as any).update({
        contacto: newContacto || null,
        instagram: newInstagram || null,
        que_recibe: newQueRecibe || null,
        notas: newNotas || null,
        link_inscripcion: newLinkInscripcion || null
      }).eq('id', punto.id);
      updatedCount++;
    }
  }

  return NextResponse.json({ success: true, updatedCount })
}

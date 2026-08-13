import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase env vars")
}

const supabase = createClient(supabaseUrl, supabaseKey)

// RegEx patterns
const phoneRegex = /(?:\+?57)?\s*(?:3\d{2})[\s-]?\d{3}[\s-]?\d{4}/g;
const instaUrlRegex = /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)/g;
const instaHandleRegex = /@([a-zA-Z0-9_.-]+)/g;

async function run() {
  const { data: puntos, error } = await supabase.from('puntos_ayuda').select('*')
  if (error || !puntos) {
    console.error("Error fetching data:", error)
    return
  }

  console.log(`Analyzing ${puntos.length} puntos...`);
  
  for (const punto of puntos) {
    let changed = false;
    let newContacto = punto.contacto || '';
    let newInstagram = punto.instagram || '';
    let newQueRecibe = punto.que_recibe || '';
    let newNotas = punto.notas || '';

    const extractData = (text: string, isFieldQueRecibe: boolean) => {
      if (!text) return text;
      let extracted = text;

      // Extract Instagram URLs
      const urls = text.match(instaUrlRegex);
      if (urls) {
        urls.forEach(url => {
          if (!newInstagram) newInstagram = url;
          extracted = extracted.replace(url, '');
        });
      }

      // Extract Instagram Handles
      const handles = extracted.match(instaHandleRegex);
      if (handles) {
        handles.forEach(handle => {
          // ignore emails
          if (handle.includes('@') && extracted.includes(handle + '.')) return;
          if (!newInstagram) newInstagram = `https://instagram.com/${handle.replace('@', '')}`;
          extracted = extracted.replace(handle, '');
        });
      }

      // Extract Phones
      const phones = extracted.match(phoneRegex);
      if (phones) {
        phones.forEach(phone => {
          if (!newContacto.includes(phone.trim())) {
            newContacto += (newContacto ? ' - ' : '') + phone.trim();
          }
          extracted = extracted.replace(phone, '');
        });
      }

      // Cleanup dangling labels like "Contacto: ", "Instagram: ", "WhatsApp: "
      extracted = extracted.replace(/(?:Contacto|WhatsApp|Celular|Teléfono|Instagram|IG|Wa|Wpp|Cel):?\s*(?:-)?\s*(?=\n|$)/gi, '');
      
      return extracted.trim();
    }

    const prevQueRecibe = newQueRecibe;
    newQueRecibe = extractData(newQueRecibe, true);
    
    const prevNotas = newNotas;
    newNotas = extractData(newNotas, false);
    
    if (newContacto !== (punto.contacto || '')) changed = true;
    if (newInstagram !== (punto.instagram || '')) changed = true;
    if (newQueRecibe !== prevQueRecibe) changed = true;
    if (newNotas !== prevNotas) changed = true;

    if (changed) {
      console.log(`[Updating] ${punto.nombre}`);
      await supabase.from('puntos_ayuda').update({
        contacto: newContacto || null,
        instagram: newInstagram || null,
        que_recibe: newQueRecibe || null,
        notas: newNotas || null
      }).eq('id', punto.id);
    }
  }
  
  console.log('Finished extraction!');
}

run();

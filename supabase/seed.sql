-- ============================================================
-- SEED DATA — Bogotá, Colombia (agosto 2026)
-- Fuente: "VOLUNTARIADO EN TIEMPO REAL BOGOTÁ" (Google Sheets)
-- Hojas: Voluntariado, Donaciones, Mascotas
-- ============================================================

insert into public.puntos_ayuda
  (nombre, direccion, ciudad, pais, lat, lng, tipo_apoyo, que_recibe, estado, contacto, link_inscripcion, horario, notas, instagram)
values

-- ────── HOJA: VOLUNTARIADO BOGOTÁ ──────────────────────────

('Fundación El Combo',
 'Carrera 98 # 156C-10', 'Bogotá', 'Colombia', 4.73890, -74.10580,
 ARRAY['Voluntariado en sitio','Organizar donaciones'],
 'Centros de acopio en Kennedy, Floresta, La Asunción, Santa María del Lago',
 'necesita_apoyo', null, 'No se requiere inscripción', '8:00am - 5:00pm', null,
 'https://www.instagram.com/reel/Db9cfbXAvWw/'),

('Fundación Mahuampi',
 'Carrera 116A # 15C-70', 'Bogotá', 'Colombia', 4.69180, -74.15830,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null, null, '9:00am - 5:00pm', null, null),

('Fundación TAAP',
 'Km 1.5 vía Bogotá-Mosquera', 'Bogotá', 'Colombia', 4.68940, -74.17260,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null,
 'https://docs.google.com/forms/d/1UpclfH_pAtUeYn0da14Q6Ef2HnP2RwwzaLxmdP_cLKw/viewform',
 'Lun-Vie: 8:00am-3:00pm, Sáb: 8:00am-12:00pm',
 'Si vas en carro o moto, mandar placa o # de registro',
 'https://www.instagram.com/fundaciontaap/'),

('122 Plaza Apartahotel',
 'Carrera 15A # 122-27', 'Bogotá', 'Colombia', 4.70050, -74.04980,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null, 'Por orden de llegada', '8:00am - 9:00pm', null, null),

('Compensar Carrera 60 — Voluntariado',
 'Av La Esmeralda #66B-05', 'Bogotá', 'Colombia', 4.69210, -74.09940,
 ARRAY['Voluntariado en sitio','Organizar donaciones'], null,
 'necesita_apoyo', 'Preguntar con @estaesmivuelta o @fiorellagrimaldi', null,
 '7:00am - 3:00pm',
 'A las 3pm sale camión hacia Buenaventura con insumos',
 'https://www.instagram.com/reel/Db9y24hOfVI/'),

('Teatro de Garaje',
 'Carrera 10 # 54A-27', 'Bogotá', 'Colombia', 4.64520, -74.06180,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null, null, 'Desde la 1pm', null, null),

('Taller Distinto',
 'Transversal 1 #83-51', 'Bogotá', 'Colombia', 4.66910, -74.02540,
 ARRAY['Voluntariado en sitio','Organizar donaciones'], null,
 'necesita_apoyo', null, null, 'Desde la 1:30pm',
 'Edificio altos del retiro. Camión pasa viernes 14 en la tarde',
 'https://www.instagram.com/tallerdistinto/'),

('Palacio de los Deportes',
 'Calle 63 #59A-06', 'Bogotá', 'Colombia', 4.66250, -74.10320,
 ARRAY['Voluntariado en sitio','Organizar donaciones'], null,
 'necesita_apoyo', null, null, '8:00am - 8:00pm', null, null),

('Camión Cra 14 #83',
 'Carrera 14 #83-53', 'Bogotá', 'Colombia', 4.66720, -74.05470,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null,
 'https://chat.whatsapp.com/Dee6lDBdRwiH416RFhJyU6',
 '3:00pm - 9:00pm', 'Transporte sale el lunes festivo',
 'https://www.instagram.com/p/Db_JVQUxdjz/'),

('Vive Claro — Voluntariado',
 'Carrera 60 #42-41', 'Bogotá', 'Colombia', 4.63840, -74.10280,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', '3162733960, 3046200006, 3217744609',
 'https://forms.cloud.microsoft/pages/responsepage.aspx?id=VHyXFlpS7Ey9K8HEea7b6wSRScHkLPtFsicCOZ0Y3u1UOUlMOUNDMDVOSVdaQ0VGRlU1U1AySE1GUi4u',
 '2:00pm - 5:00pm', 'A las 2pm volverán a necesitar voluntarios',
 'https://www.instagram.com/viveclaro_co/'),

('Fundación Mujeres por la Democracia',
 'Carrera 15 #82-81', 'Bogotá', 'Colombia', 4.66510, -74.05360,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null,
 'https://docs.google.com/forms/d/1UpclfH_pAtUeYn0da14Q6Ef2HnP2RwwzaLxmdP_cLKw/viewform',
 '8:00am - 5:00pm', null,
 'https://www.instagram.com/mujeresporlademocraciacolom/'),

('Power the Mov',
 'Carrera 7 #61-38', 'Bogotá', 'Colombia', 4.64870, -74.06190,
 ARRAY['Voluntariado en sitio'], null,
 'cubierto', '3192966242', 'No se requiere inscripción', null, null,
 'https://www.instagram.com/powerthemov/'),

('SOS Juntos por el Chocó',
 'Calle 38 #29-29', 'Bogotá', 'Colombia', 4.63220, -74.07910,
 ARRAY['Voluntariado en sitio','Organizar donaciones'], null,
 'necesita_apoyo', null,
 'https://chat.whatsapp.com/FTiedxGDwuoFPkSdE6upns',
 '8:00am - 6:00pm', 'Unirse al chat de WhatsApp o llegar directamente',
 'https://www.instagram.com/soschoco_/'),

('Siberia — Interpark',
 'Parque industrial Interpark km 6.5 autopista Medellín', 'Bogotá', 'Colombia',
 4.75690, -74.17140,
 ARRAY['Organizar donaciones'], null,
 'cubierto', null, null, 'Desde las 8:00am - 12pm', null, null),

('Galería Aborigen',
 'Carrera 6A # 116-17', 'Bogotá', 'Colombia', 4.70210, -74.04930,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null,
 'https://docs.google.com/forms/d/e/1FAIpQLScgbOf6FmuY3UxTWnP9MiDNokxspw1dgDlCuDExdUbTqqLj2g/viewform',
 '10:00am - 9:00pm', 'Se necesitan personas el 13, 14, 15 y 16 de agosto',
 'https://www.instagram.com/galeriaaborigen/'),

('Casa Azul',
 'Carrera 20 #45A-33', 'Bogotá', 'Colombia', 4.63890, -74.07460,
 ARRAY['Organizar donaciones'], null,
 'cubierto', null, null, '10:00am - 7:00pm',
 'Llevar cajas. Primer envío viernes 14', null),

('Usaquén — Punto de Acopio',
 'Calle 161A #7F-55', 'Bogotá', 'Colombia', 4.75790, -74.03760,
 ARRAY['Voluntariado en sitio'], null,
 'cubierto', '3108514846, 3125192533, 3208331118, 3114792660, 3155244162',
 null, '8:00am - 9:00pm', null, null),

('Unicentro — Voluntariado',
 'Carrera 15 #124-30', 'Bogotá', 'Colombia', 4.70320, -74.04940,
 ARRAY['Voluntariado en sitio','Organizar donaciones'], null,
 'cubierto', '3106486849, 3112825017, 3212160424, 3014898703, 3113882262',
 null, '8:00am - 9:00pm',
 'Por orden de llegada. No se necesitan hoy jueves 13 ni viernes 14', null),

('Universidad Jorge Tadeo Lozano',
 'Carrera 4 #22-61', 'Bogotá', 'Colombia', 4.61210, -74.07450,
 ARRAY['Voluntariado en sitio'], null,
 'cubierto', '3005000023, 3222187522, 3188202682',
 null, '8:00am - 9:00pm',
 'Ya no van a permitir más externos hasta el fin de semana, solo estudiantes', null),

('Fundación Catalina Muñoz',
 'Diagonal 48 #19-16', 'Bogotá', 'Colombia', 4.63620, -74.07110,
 ARRAY['Voluntariado en sitio'], null,
 'cubierto', '3167446507, 3002618537',
 null, '8:00am - 5:00pm (puede extenderse)', null,
 'https://www.instagram.com/fcatalinamunoz/'),

('C.C. Nuestro Bogotá — Voluntariado',
 'Carrera 86 #55A-75', 'Bogotá', 'Colombia', 4.65120, -74.12950,
 ARRAY['Voluntariado en sitio','Organizar donaciones'], null,
 'cubierto', '3218686079, 31108453511',
 null, '10:00am - 7:00pm', 'Solo donaciones por ahora',
 'https://www.instagram.com/nuestrobogotacc/'),

('Estadio El Campín — Voluntariado',
 'NQS con Calle 57', 'Bogotá', 'Colombia', 4.64710, -74.08360,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', '3142858657, 3154198165, 3204724711, 3005239611',
 'https://forms.cloud.microsoft/pages/responsepage.aspx?id=eLMFyErLDUae1xvpnzG_d5BrwyMuOVBCkz1jLQ2ffZlUQTZCUzBBSTZKNzFERTAwVUdQVUJPUE5WVy4u',
 '7:00am-12pm, 1pm-6pm, 6pm-10pm, 10pm-5am',
 'Voluntarios sáb y dom con camiseta Colombia. A partir de las 7pm no requiere inscripción',
 'https://www.instagram.com/senciabogota/'),

('Cruz Roja Colombiana',
 'Carrera 24 #73-38', 'Bogotá', 'Colombia', 4.65810, -74.08590,
 ARRAY['Voluntariado en sitio','Entregar donaciones','Recibe víveres'], null,
 'necesita_apoyo', null, null, '24 Horas', null, null),

('Banco de Alimentos de Bogotá',
 'Calle 19A #32-50', 'Bogotá', 'Colombia', 4.61890, -74.07910,
 ARRAY['Voluntariado en sitio','Recibe víveres'], null,
 'cubierto', '3115750964',
 'https://docs.google.com/forms/d/e/1FAIpQLSfb556KyRsJfU5xrtSuqdmQMB6pff5DgR18NlbkLJ0bU2fAgg/viewform',
 null, 'Desde el 14 de septiembre',
 'https://www.instagram.com/bancodealimentosbgt/'),

('Minuto de Dios',
 'Carrera 73A #81-98', 'Bogotá', 'Colombia', 4.66860, -74.11420,
 ARRAY['Voluntariado en sitio'], null,
 'necesita_apoyo', null,
 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=1hktZcHt20OiTp6UP97jlZ5x13KKd9FLmDdE5QCDthVURE5BWlEwVFUyNVlDS1lXN0NCWk40WFI4OS4u',
 'Lun-Vie: 8:00am-5:00pm, Sáb: 9:00am-1:00pm',
 'Recepción de voluntarios a partir del 25 de agosto', null),

('CRIC',
 'Calle 12F #2-75', 'Bogotá', 'Colombia', 4.59720, -74.07520,
 ARRAY['Voluntariado en sitio'], null,
 'cubierto', null,
 'https://docs.google.com/forms/d/e/1FAIpQLSdyk8YF_xPV-DHA8-iihEp9QLREXMBbHpFVzUvVPRKRpCDBeg/closedform',
 null, null, null),

('C.C. Multiplaza',
 'Calle 19A # 72-57', 'Bogotá', 'Colombia', 4.61570, -74.11540,
 ARRAY['Organizar donaciones'], null,
 'cubierto', null, null, '2:00pm - 9:00pm',
 'Por orden de llegada. Sótano 2, bajando escaleras por El Éxito', null),

('UNAL Capilla — Universidad Nacional',
 'Universidad Nacional de Colombia', 'Bogotá', 'Colombia', 4.63609, -74.08276,
 ARRAY['Voluntariado en sitio'], null,
 'cubierto', null,
 'https://calendar.google.com/calendar/u/0/appointments/AcZssZ2m7wBm_GVmIVbKyjpENo3Elkts84sRmsalz5I=',
 null, 'Por el momento lleno, posibilidad de inscribirse desde el 25 de agosto', null),

-- ────── HOJA: DONACIONES ───────────────────────────────────

('Unicentro — Donaciones',
 'Carrera 15 #124-30', 'Bogotá', 'Colombia', 4.70320, -74.04940,
 ARRAY['Entregar donaciones','Recibe víveres'],
 'URGENTE: CURAS, BOTIQUINES, ESPARADRAPOS, SUTURAS. Medicamentos: LOSARTAN, AMLODIPINO, DEXAMETASONA, AMOXICILINA, ACETAMINOFEN, ASPIRINA. Bebés: pañitos, compotas (NO vidrio). Aseo: pañales adultos, shampoo. Hábitat: colchonetas, cobijas.',
 'necesita_apoyo', null, null, '9:00am - 9:00pm',
 'Entregar en Plaza de Banderas, carpas rojas y blancas. Llevar kits organizados y marcados.', null),

('Estadio El Campín — Donaciones',
 'NQS con Calle 57', 'Bogotá', 'Colombia', 4.64710, -74.08360,
 ARRAY['Entregar donaciones','Recibe víveres'],
 'Arroz, aceite, harina, chocolate, lentejas, azúcar, frijol, sal, pasta, panela, atún, café, cepillos, pañitos, papel higiénico, shampoo, cobijas, sábanas, toallas. NO traer agua. NO pañales bebé. NO desechables.',
 'necesita_apoyo', null, null, '9:00am - 9:00pm', null, null),

('Vive Claro — Donaciones',
 'Carrera 60 #42-41', 'Bogotá', 'Colombia', 4.63840, -74.10280,
 ARRAY['Entregar donaciones'], 'Llevar bolsas',
 'necesita_apoyo', null, null, null, null, null),

('C.C. Nuestro Bogotá — Donaciones',
 'Carrera 86 #55A-75', 'Bogotá', 'Colombia', 4.65120, -74.12950,
 ARRAY['Entregar donaciones','Recibe víveres'],
 'CURAS, BOTIQUINES, ESPARADRAPOS, alimentos no perecederos, agua, pañitos bebé, compotas (no vidrio), pañales adultos, shampoo, colchonetas camping, cobijas.',
 'necesita_apoyo', null, null, '10:00am - 7:00pm',
 'Entregar en Entrada 1, al lado de KOAJ. No se requieren voluntarios hoy jueves 13 y viernes 14.',
 'https://www.instagram.com/nuestrobogotacc/'),

('Compensar Carrera 60 — Donaciones',
 'Carrera 60 #66B-05', 'Bogotá', 'Colombia', 4.69210, -74.09940,
 ARRAY['Entregar donaciones','Recibe víveres'],
 'Comida para gatos y perros, agua, medicamentos, artículos de aseo, alimentos no perecederos.',
 'necesita_apoyo', null, null, 'Camión sale a las 3pm hacia Buenaventura', null, null),

('Universidad Distrital — Bosa',
 'Calle 52 Sur # 93D-97', 'Bogotá', 'Colombia', 4.57780, -74.18210,
 ARRAY['Entregar donaciones','Recibe víveres'],
 'Alimentos e insumos. NO dinero.',
 'necesita_apoyo', null, null, null, null, null),

('The Spot Park',
 'Carrera 13A #37-68', 'Bogotá', 'Colombia', 4.63430, -74.06980,
 ARRAY['Entregar donaciones','Recibe agua','Recibe víveres'],
 'Agua, kits de aseo, medicamentos, cobijas. También donaciones en dinero.',
 'necesita_apoyo', null, null, null, null, null),

('Casa Aborigen — Donaciones',
 'Bogotá (confirmar dirección)', 'Bogotá', 'Colombia', 4.66200, -74.07200,
 ARRAY['Entregar donaciones'],
 'URGENTE: Ollas de acero, vasos, cucharas, cuchillos, cubiertos, puntillas gruesas, alambre.',
 'necesita_apoyo', null, null, null, null, null),

('Universidad Cooperativa de Colombia',
 'Carrera 9 # 172-90', 'Bogotá', 'Colombia', 4.76820, -74.03640,
 ARRAY['Entregar donaciones','Recibe víveres'], null,
 'necesita_apoyo', null, null, null, null, null),

-- ────── HOJA: MASCOTAS / ANIMALES ──────────────────────────

('Zoolidaridad por Colombia',
 'Bogotá (confirmar dirección)', 'Bogotá', 'Colombia', 4.62290, -74.07330,
 ARRAY['Rescate animal','Recibe víveres'],
 'Animales afectados por el terremoto — por confirmar necesidades',
 'necesita_apoyo', null, null, '8:00am - 9:00pm',
 'Rescate y atención de animales', null),

('Patitas de la Protesta',
 'Calle 90 #12-45', 'Bogotá', 'Colombia', 4.67900, -74.03990,
 ARRAY['Rescate animal'], null,
 'necesita_apoyo', '313 320 5153', null, null, null,
 'https://www.instagram.com/patitasdelaprotesta/'),

('Laika Mascotas',
 'Bogotá (confirmar dirección)', 'Bogotá', 'Colombia', 4.65140, -74.07480,
 ARRAY['Rescate animal'], null,
 'cubierto', null, null, null, null,
 'https://www.instagram.com/laikamascotas/');

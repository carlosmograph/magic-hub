/* Endereços das páginas do Magic Hub. A chave "anon"/publicável do Supabase é pública
   por desenho (o RLS das tabelas hub_* não deixa ela ler nada); o resto passa pela função. */
window.CRMO_SITE = {
  supabaseUrl: "https://seetxjvoehgenxydxpuf.supabase.co",
  supabaseChave: "sb_publishable_BLt96Bgx8XChryATQgeTGQ_7OYbx9Vk",
  api: "https://seetxjvoehgenxydxpuf.supabase.co/functions/v1/hub/api",
  // Página /contato. PREENCHER: WhatsApp só com números (55 + DDD + número) e o @ do Instagram sem o @.
  // Vazio = o botão aparece como "em breve".
  whatsapp: "",
  instagram: ""
};

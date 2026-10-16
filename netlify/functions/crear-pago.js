const H=(s,b)=>({statusCode:s,headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
exports.handler=async(event)=>{
  if(event.httpMethod!=='POST')return H(405,{error:'metodo'});
  const {SUPABASE_URL,SUPABASE_SERVICE_KEY,MP_ACCESS_TOKEN,SITE_URL,PRECIO}=process.env;
  const token=(event.headers.authorization||'').replace('Bearer ','');
  // 1) Verificar quién es el médico con su sesión de Supabase
  const u=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_SERVICE_KEY,Authorization:`Bearer ${token}`}});
  if(!u.ok)return H(401,{error:'sesion invalida'});
  const user=await u.json();
  // 2) Crear el pago único en Mercado Pago (Checkout Pro)
  const r=await fetch('https://api.mercadopago.com/checkout/preferences',{
    method:'POST',
    headers:{Authorization:`Bearer ${MP_ACCESS_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      items:[{title:'HistoriaYa - acceso',quantity:1,unit_price:Number(PRECIO),currency_id:'ARS'}],
      payer:{email:user.email},
      external_reference:user.id,
      back_urls:{success:SITE_URL,failure:SITE_URL,pending:SITE_URL},
      auto_return:'approved',
      notification_url:`${SITE_URL}/.netlify/functions/webhook-mp`
    })
  });
  const d=await r.json();
  if(!r.ok)return H(502,{error:d.message||'error de Mercado Pago'});
  return H(200,{init_point:d.init_point});
};

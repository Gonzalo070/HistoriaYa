// Mercado Pago avisa acá. No confiamos en el aviso: consultamos el pago real a la API con nuestro token.
const OK={statusCode:200,body:'ok'};
exports.handler=async(event)=>{
  const {SUPABASE_URL,SUPABASE_SERVICE_KEY:K,MP_ACCESS_TOKEN,DIAS_ACCESO}=process.env;
  let tipo='',id=null;
  try{const b=JSON.parse(event.body||'{}');tipo=String(b.type||b.topic||'');id=b.data&&b.data.id}catch(_){}
  const qs=event.queryStringParameters||{};
  id=id||qs['data.id']||qs.id;tipo=tipo||String(qs.type||qs.topic||'');
  if(!id||tipo!=='payment')return OK;
  const r=await fetch(`https://api.mercadopago.com/v1/payments/${id}`,{headers:{Authorization:`Bearer ${MP_ACCESS_TOKEN}`}});
  if(!r.ok)return {statusCode:500,body:'mp'};
  const p=await r.json();
  const uid=p.external_reference;if(!uid)return OK;
  let cambio=null;
  if(p.status==='approved'){
    const dias=Number(DIAS_ACCESO);   // vacío o 0 = acceso de por vida
    cambio={subscription_status:'active',current_period_end:dias>0?new Date(new Date(p.date_approved).getTime()+dias*864e5).toISOString():null,mp_payment_id:String(p.id)};
  }else if(['refunded','charged_back','cancelled'].includes(p.status)){
    cambio={subscription_status:'inactive',current_period_end:null};
  }
  if(!cambio)return OK;
  const up=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`,{
    method:'PATCH',
    headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},
    body:JSON.stringify(cambio)
  });
  return up.ok?OK:{statusCode:500,body:'db'};
};

const res = await fetch('https://api.checkout.infinitepay.io/links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    handle: 'delso-palmeira-de',
    order_nsu: 'diag-' + Date.now(),
    items: [{ description: 'Teste Corre Conça', quantity: 1, price: 2500 }],
    customer: { name: 'Teste', phone_number: '+5575981937220' },
    webhook_url: 'https://www.correconca.com/api/webhook/infinitepay',
    redirect_url: 'https://www.correconca.com/acompanhar/token-teste',
  }),
})
console.log('Status HTTP:', res.status)
const json = await res.json()
console.log('Resposta completa:', JSON.stringify(json, null, 2))
console.log('Campo url:', json.url ?? 'AUSENTE ❌')

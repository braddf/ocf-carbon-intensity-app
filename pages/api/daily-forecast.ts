// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const headers = {
    'Accept': 'application/json'
  };

  console.log(req.query)
  fetch(`https://api.carbonintensity.org.uk/intensity/date/${req.query.date}`,
    {
      method: 'GET',
      headers: headers
    })
    .then(async function (data) {
      const result = await data.json();
      res.status(200).json(result)
    }).catch(function (body) {
    console.log(body);
    res.status(500).json(body)
  });
}

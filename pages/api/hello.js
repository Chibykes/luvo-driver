// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  // res.status(200).json({ name: 'John Doe' })

  if(req.body.tag === "@chibykes"){
    return res.json({
      tag: "@chibykes",
      transname: "Chibykes Motors"
    });
  }

  res.json(null);
}

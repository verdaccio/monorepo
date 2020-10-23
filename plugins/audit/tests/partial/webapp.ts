// @ts-ignore
import express from 'express';
// @ts-ignore
import bodyParser from 'body-parser';

function generateApp() {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));

  return app;
}

export default generateApp;

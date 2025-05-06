import express from 'express';
import { version } from '../package.json';

const app = express();

app.all('/', (_req, res) => {
  res.json({
    message: `Hello from the server ${version}`,
    version,
  });
});

app.all('/help', (_req, res) => {
  res.json({
    message: `This is some help text for ${version}`,
    version,
  });
});

app.listen(1234, () => {
  console.log(`Server running on port 1234`);
});


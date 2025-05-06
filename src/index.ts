import express from 'express';
import { version } from '../package.json';

const app = express();

app.get('/', (_req, res) => {
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

app.use((req, res) => {
  res.status(404).json({
    message: `Not found ${version}`,
    method: req.method,
    path: req.path,
    version,
  });
});

app.listen(1234, () => {
  console.log(`Server running on port 1234`);
});


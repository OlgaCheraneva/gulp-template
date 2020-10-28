'use strict';

const express = require('express');
const path = require('path');
const {port} = require('yargs').argv;
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

const publicURL = process.env.PUBLIC_URL || '';

const app = express();

if (!port) {
    throw new Error('Аргумент "port" должен быть определен, смотри README');
}

const accessLogStream = rfs.createStream(
    `/access_[${new Date().toLocaleDateString()}].log`,
    {
        interval: '1d', // rotate daily (раз в сетки будет создавать файл)
        size: '10M',
        compress: true,
        path: path.join(__dirname, 'logs'),
    }
);

app.use(
    morgan(
        'CORSEARCH-DOC: :method :url :status time: :response-time :date[clf]',
        {stream: accessLogStream}
    )
);

app.use(`${publicURL}`, express.static(path.join(__dirname, 'dist')));

app.get(`${publicURL}*`, function (_req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

console.log(`Started at http://0.0.0.0:${port}${publicURL}`);
app.listen(port);

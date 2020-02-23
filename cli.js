#!/usr/bin/env node

const { exec } = require('child_process');
const inquirer = require('inquirer');

const [, , ...args] = process.argv;

const isTest = args[0] || false;

async function main(isTest = false) {
  const prompt = inquirer.createPromptModule();

  const packages = [];
  const devPackages = ['eslint'];

  const { isTypescript } = await prompt([
    { type: 'confirm', name: 'isTypescript', message: 'Install Typescript?', default: true }
  ]);

  if (isTypescript) devPackages.push('typescript', '@types/node');

  const { isExpress, isReact } = await prompt([
    { type: 'confirm', name: 'isExpress', message: 'Install Express?', default: true },
    { type: 'confirm', name: 'isReact', message: 'Install React?', default: true }
  ]);

  if (isExpress) {
    packages.push('express');
    if (isTypescript) devPackages.push('@types/express');
  }

  if (isReact) {
    packages.push('react', 'react-dom');
    devPackages.push(
      'webpack',
      'webpack-cli',
      '@babel/core',
      '@babel/preset-env',
      '@babel/preset-react',
      'babel-loader',
      'style-loader',
      'css-loader',
      'postcss-loader',
      'sass-loader',
      'url-loader',
      'file-loader',
      'node-sass',
      'html-webpack-plugin',
      'clean-webpack-plugin',
      'url-loader'
    );
    if (isTypescript) devPackages.push('@types/react', '@types/react-dom', 'awesome-typescript-loader');

    const { isReachRouter } = await prompt([
      {
        type: 'confirm',
        name: 'isReachRouter',
        message: 'Install @reach/router (replaces react-router-dom)?',
        default: true
      }
    ]);

    if (isReachRouter) {
      packages.push('@reach/router');
      if (isTypescript) devPackages.push('@types/reach__router');
    }
  }

  const commands = [`npm init -y ${isTest ? '--dry-run' : ''}`];
  if (packages.length > 0) commands.push([`npm install ${packages.join(' ')} ${isTest ? '--dry-run' : ''}`]);
  if (devPackages.length > 0) {
    commands.push([`npm install --save-dev ${devPackages.join(' ')} ${isTest ? '--dry-run' : ''}`]);
  }

  exec(commands.join(' & '), (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    if (stderr) {
      console.warn(stderr);
      return;
    }
    console.log(stdout);
  });
}

main(isTest);

//

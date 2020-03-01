#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const inquirer = require('inquirer');

const [, , ...args] = process.argv;

const isTest = args[0] === '--test' || false;

async function main(isTest = false) {
  const prompt = inquirer.createPromptModule();

  const commands = [`npm init -y ${isTest ? '--dry-run' : ''}`];
  const packages = [];
  const devPackages = ['eslint', 'cross-env'];

  if (isTest) console.log('Running as a test...');

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
      'webpack-dev-server',
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

  if (!isTest) {
    //const gitignore = `echo "node_modules/${isReact ? '\ndist/' : ''}" >> .gitignore`;
    //console.log('gitignore', gitignore);
    commands.push('mkdir src');

    if (isReact) commands.push('mkdir src/components');
  }

  if (packages.length > 0) commands.push([`npm install ${packages.join(' ')} ${isTest ? '--dry-run' : ''}`]);
  if (devPackages.length > 0) {
    commands.push([`npm install --save-dev ${devPackages.join(' ')} ${isTest ? '--dry-run' : ''}`]);
  }

  console.log(commands.join(' && '));

  exec(commands.join(' && '), (err, stdout, stderr) => {
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

  console.log(
    `Copying >> ${path.resolve(__dirname, 'templates', 'tsconfig.template.json')}\nTo >> ${path.resolve(
      process.cwd(),
      'tsconfig.json'
    )}`
  );

  if (!isTest) {
    // Copy TS config.
    if (isTypescript) {
      fs.copyFile(
        path.resolve(__dirname, 'templates', 'tsconfig.template.json'),
        path.resolve(process.cwd(), 'tsconfig.json'),
        err => {
          if (err) throw err;
          console.log('Successfully created Typescript config.');
        }
      );
    }

    // Copy WEBPACK config.
    if (isReact) {
      if (isTypescript) {
        fs.copyFile(
          path.resolve(__dirname, 'templates', 'tsx-webpack.template.js'),
          path.resolve(process.cwd(), 'webpack.config.js'),
          err => {
            if (err) throw err;
            console.log('Successfully created Webpack config.');
          }
        );
      } else {
        fs.copyFile(
          path.resolve(__dirname, 'templates', 'jsx-webpack.template.js'),
          path.resolve(process.cwd(), 'webpack.config.js'),
          err => {
            if (err) throw err;
            console.log('Successfully created Webpack config.');
          }
        );
      }

      fs.copyFile(
        path.resolve(__dirname, 'templates', 'tempate.html'),
        path.resolve(process.cwd(), 'templates', 'index,html'),
        err => {
          if (err) throw err;
          console.log('Successfully created index.html template.');
        }
      );
    }
  }
}

main(isTest);

//

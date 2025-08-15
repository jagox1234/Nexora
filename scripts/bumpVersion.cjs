#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sem = process.argv[2] || 'patch';
const pkgPath = path.join(__dirname,'..','package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
let [major,minor,patch]=pkg.version.split('.').map(Number);
if(sem==='major'){major++;minor=0;patch=0;}else if(sem==='minor'){minor++;patch=0;}else{patch++;}
const newVersion = `${major}.${minor}.${patch}`;
pkg.version=newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2)+"\n");
console.log('Version bumped to', newVersion);
// Append to CHANGELOG Unreleased: could automate extraction later

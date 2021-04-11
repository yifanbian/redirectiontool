import fs from 'fs';
import process from 'process';
import { Liquid } from 'liquidjs';
const engine = new Liquid();

async function liquidifyWranglerConfiguration() {
    const template = fs.readFileSync('wrangler.toml.template', 'utf-8');
    var rendered = await engine.parseAndRender(template, process.env);
    fs.writeFileSync('wrangler.toml', rendered, { encoding: 'utf-8' });
}

liquidifyWranglerConfiguration();

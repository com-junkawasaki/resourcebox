// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ResourceBox',
			description: 'TypeBox-inspired RDF Resource type builder with SHACL validation and OWL ontology support',
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/gftdcojp/resourcebox' 
				}
			],
			customCss: [
				'./src/styles/custom.css',
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'introduction' },
						{ label: 'Installation', slug: 'installation' },
						{ label: 'Quick Start', slug: 'quick-start' },
						{ label: 'Design Philosophy', slug: 'philosophy' },
					],
				},
			{
				label: 'Onto Layer',
				items: [
					{ label: 'Overview', slug: 'onto/overview' },
				],
			},
			{
				label: 'Resource Layer',
				items: [
					{ label: 'Overview', slug: 'resource/overview' },
				],
			},
			{
				label: 'Shape Layer',
				items: [
					{ label: 'Overview', slug: 'shape/overview' },
				],
			},
			{
				label: 'Examples',
				items: [
					{ label: 'Basic Usage', slug: 'examples/basic' },
				],
			},
				{
					label: 'Migration',
					items: [
						{ label: 'From v0.3.x', slug: 'migration/from-0-3' },
					],
				},
			],
		}),
	],
});

const findInFiles = require('find-in-files');
const dayjs = require('dayjs');
const fs = require('fs');

let md = ['# TODO', '', `Generated ${dayjs().format('ddd MMM D YYYY h:mm a')}`, ''];

let stripComment = str => {
	return str.replace(/(\/\/|\<\!\-\-|\*)/gi, '');
};

findInFiles.find('TODO:', './src').then(res => {
	let fileNames = Object.keys(res);
	fileNames.forEach(name => {
		let file = name;
		let node = res[file];
		md.push(`- **${file}**`);
		node.line.forEach(line => {
			md.push(`   - ${stripComment(line).trim()}`);
		});
	});
	fs.writeFileSync('./TODO.md', md.join(`\n`), 'UTF-8');
});

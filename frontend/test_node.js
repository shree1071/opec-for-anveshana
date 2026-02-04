const fs = require('fs');
try {
    fs.writeFileSync('test_output.txt', 'Hello from Node!');
    console.log('File written');
} catch (e) {
    console.error(e);
}

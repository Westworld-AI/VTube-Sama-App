// typeorm-create.js
const { exec } = require('child_process');
const migrationName = process.argv[2];

// Make sure the migration name is provided
if (!migrationName) {
  throw new Error('Error: Migration name not provided!');
}

const command = `node ./release/app/node_modules/typeorm/cli.js migration:create src/main/migrations/${migrationName}`;

// Execute the TypeORM command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`An error occurred: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error output: ${stderr}`);
  }
  console.log(`Migration created: ${stdout}`);
});

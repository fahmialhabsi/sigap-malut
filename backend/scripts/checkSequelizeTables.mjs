import { sequelize } from '../config/database.js';

(async ()=>{
  try{
    await sequelize.authenticate();
    const [rows] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
    console.log('Using Sequelize connection, tables:');
    rows.forEach(r=>console.log('  '+Object.values(r)[0]));
    await sequelize.close();
  }catch(e){
    console.error('ERROR', e);
    process.exit(1);
  }
})();

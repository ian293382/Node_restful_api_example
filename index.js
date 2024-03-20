import express from 'express';
import mysql from 'mysql';
import sequlizePackage from 'sequelize';
const {DataTypes, Model, Sequelize} = sequlizePackage;

const sequelize = new Sequelize('TodoList', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});


// 驗證連接
try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database successfully');
} catch (err) {
    console.error('Unable to connect to the database:', err);
}

class Todo extends Model {}
Todo.init({
    id: { type: DataTypes.INTEGER, primaryKey: true },
    title: { type: DataTypes.STRING }
}, { sequelize, modelName: 'Todo', tableName: 'Todo' });

await sequelize.sync(); // 同步模型與數據庫

const app = express();
const port = 3000;

app.use(express.json()); // 使用中間件來解析 JSON 格式的請求主體

app.post('/', async (req, res) => {
    try {
        const newTodo = await Todo.create({ id: req.body.id, title: req.body.title });
        res.setHeader('Content-Type', 'application/json');
        res.json(newTodo.toJSON());
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).send('Error creating todo');
    }
});


app.get('/', async (req, res) => {
    const allTodo = await Todo.findAll()
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(allTodo));
    res.end();
});

app.get('/:id', async (req, res) => {
    const find_the_one_Todo = await Todo.findByPk(req.params.id);
    if (find_the_one_Todo) {
        res.json(find_the_one_Todo);
    } else {
        res.status(404).send('資源未找到');
    }
});

app.put('/:id', async(req, res)=> {
    const find_the_one_Todo = await Todo.findByPk(req.params.id);
    find_the_one_Todo.set('title', req.body.title);
    await find_the_one_Todo.save()
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(find_the_one_Todo.toJSON()));
    res.end();
})

app.delete('/:id', async(req, res)=> {
    await Todo.destroy({ where: { id: req.params.id } });
    res.write('ok');
    res.end();
})

// 監聽指定的端口
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

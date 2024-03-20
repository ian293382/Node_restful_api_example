import express from 'express';
import mysql from 'mysql';
import { resolve } from 'path';

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'ToDoList'
});

const app = express();
const port = 3000;

//建立中間器
app.use(express.json());

// 改善POST call back 方式
function getConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn)=> {
            if (err) reject(err);
            else resolve(conn);
        });
    });
}

function executeQuery(conn, query, data) {
    return new Promise((resolve, reject) => {
        conn.query(query, data, (err, results, fields) => {
            if (err) reject(err);
            else resolve({ results, fields });
        });
    });
}
app.post('/', async(req, res) => {
    const conn = await getConnection();
    const {results, fields}= await executeQuery(conn, 'INSERT INTO Todo VALUES(?,?)',[
        req.body.id,
        req.body.title
    ]);
  
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(results));
    res.end();
});


// 在訪問根路徑時執行資料庫查詢
app.get('/', async (req, res) => {
    const conn = await getConnection();
    const {results, fields}= await executeQuery (conn,'SELECT * FROM Todo');
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(results));
    res.end();
});



app.get('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        const { results } = await executeQuery(
            conn,
            'SELECT * FROM Todo WHERE id = ?',
            [req.params.id]
        );
        if (results.length > 0) {
            const result = results[0];
            res.json(result); // 使用 res.json() 直接將物件轉換為 JSON 格式並發送回客戶端
        } else {
            res.status(404).send('Resource not found');
        }
    } catch (error) {
        console.error('Error retrieving todo:', error);
        res.status(500).send('Error retrieving todo');
    }
});

app.put('/:id', async(req, res)=> {
    const conn = await getConnection();
    const {results, fields}= await executeQuery (conn,
        'UPDATE Todo  SET  title = ? WHERE id = ? ',
        [req.body.title, req.params.id]
    );
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(results));
    res.end();
})

app.delete('/:id', async(req, res)=> {
    const conn = await getConnection();
    const {results, fields}= await executeQuery (conn,
        'DELETE FROM Todo WHERE id = ? ',
        [req.params.id]
    );
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(results));
    res.end();
})

// 監聽指定的端口
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

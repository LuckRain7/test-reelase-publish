import { useState, useEffect } from 'react';
import { Timeline, Card, Input, DatePicker, Button, Form, List } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './App.css';

interface Todo {
  id: number;
  title: string;
  date: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [form] = Form.useForm();

  const addTodo = (values: { title: string; date: dayjs.Dayjs }) => {
    const newTodo: Todo = {
      id: Date.now(),
      title: values.title,
      date: values.date.format('YYYY-MM-DD'),
      completed: false,
    };
    setTodos([...todos, newTodo]);
    form.resetFields();
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const groupTodosByWeek = () => {
    const sorted = [...todos].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    const grouped: { [key: string]: Todo[] } = {};

    sorted.forEach(todo => {
      const date = dayjs(todo.date);
      const tuesday = date.day() <= 2 ?
        date.subtract(date.day(), 'day') :
        date.add(2 - date.day(), 'day');
      const key = tuesday.format('YYYY-MM-DD');
      grouped[key] = grouped[key] || [];
      grouped[key].push(todo);
    });

    return Object.entries(grouped);
  };

  return (
    <div className="app-container">
      <Card title="添加新任务" className="add-todo-card">
        <Form form={form} onFinish={addTodo} layout="inline">
          <Form.Item
            name="title"
            rules={[{ required: true, message: '请输入任务内容' }]}
          >
            <Input placeholder="输入任务内容" />
          </Form.Item>
          <Form.Item
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker placeholder="选择日期" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              添加任务
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Timeline
        className="todo-timeline"
        items={groupTodosByWeek().map(([week, todos]) => ({
          dot: <ClockCircleOutlined className="timeline-dot" />,
          children: (
            <Card title={`${week} 周`} key={week} className="timeline-card">
              <List
                dataSource={todos}
                renderItem={todo => (
                  <List.Item
                    onClick={() => toggleTodo(todo.id)}
                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                  >
                    <div className="todo-content">
                      <span className="todo-title">{todo.title}</span>
                      <span className="todo-date">{todo.date}</span>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          ),
        }))}
      />
    </div>
  );
}

export default App;

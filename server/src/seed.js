const fs = require('fs');
const pool = require('./config/db');
const bcrypt = require('bcrypt');

const departments = [
  { id: 1, name: 'IT', code: 'IT' },
  { id: 2, name: 'HR', code: 'HR' },
  { id: 3, name: 'Finance', code: 'FIN' },
  { id: 4, name: 'Sales', code: 'SALES' },
];

const positions = [
  { id: 1, title: 'Администратор', code: 'ADMIN', base_salary: 80000 },
  { id: 2, title: 'Руководитель подразделения', code: 'HEAD', base_salary: 70000 },
  { id: 3, title: 'Специалист кадровой службы', code: 'HR_SPEC', base_salary: 45000 },
  { id: 4, title: 'Главный разработчик', code: 'LEAD_DEV', base_salary: 60000 },
  { id: 5, title: 'Разработчик', code: 'DEV', base_salary: 40000 },
  { id: 6, title: 'Менеджер по продажам', code: 'SALES_MGR', base_salary: 35000 },
  { id: 7, title: 'Бухгалтер', code: 'ACCOUNTANT', base_salary: 40000 },
];

const roles = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'head' },
  { id: 3, name: 'hr' },
  { id: 4, name: 'acc' },
  { id: 5, name: 'common' },
];

const careerTypes = [
  { id: 1, name: 'Прием на работу' },
  { id: 2, name: 'Перевод на другую должность' },
  { id: 3, name: 'Повышение квалификации' },
  { id: 4, name: 'Награждение' },
  { id: 5, name: 'Смена отдела' }
];

const employees = [
  // Administrator (1)
  {
    last_name: 'Пичикова',
    first_name: 'Валерия',
    middle_name: 'Викторовна',
    passport: '1417 612171',
    snils: '123-456-789 01',
    phone: '+7 (999) 856 99 76',
    email: 'pichikova@company.ru',
    birth_date: '1990-05-15',
    registration_address: 'г. Москва ул. Примерная д. 1 кв. 1',
    department_id: 1,
    position_id: 1,
    hire_date: '2020-01-15',
    salary: 80000,
    status: 'active'
  },
  
  // Department Heads (4)
  {
    last_name: 'Иванов',
    first_name: 'Иван',
    middle_name: 'Евгеньевич',
    passport: '1417 612172',
    snils: '123-456-789 02',
    phone: '+7 (999) 856 99 76',
    email: 'ivanov@company.ru',
    birth_date: '1985-03-10',
    registration_address: 'г. Москва ул. Ломоносова д. 10 кв. 11',
    department_id: 1,
    position_id: 2,
    hire_date: '2021-06-15',
    salary: 70000,
    status: 'active'
  },
  {
    last_name: 'Петрова',
    first_name: 'Лилия',
    middle_name: 'Олеговна',
    passport: '1417 612173',
    snils: '123-456-789 03',
    phone: '+7 (999) 856 99 77',
    email: 'petrova@company.ru',
    birth_date: '1988-07-22',
    registration_address: 'г. Москва ул. Тверская д. 5 кв. 20',
    department_id: 2,
    position_id: 2,
    hire_date: '2020-03-01',
    salary: 70000,
    status: 'active'
  },
  {
    last_name: 'Кротов',
    first_name: 'Максим',
    middle_name: 'Петрович',
    passport: '1417 612174',
    snils: '123-456-789 04',
    phone: '+7 (999) 856 99 78',
    email: 'krotov@company.ru',
    birth_date: '1982-11-05',
    registration_address: 'г. Москва ул. Арбат д. 15 кв. 30',
    department_id: 3,
    position_id: 2,
    hire_date: '2019-08-20',
    salary: 70000,
    status: 'active'
  },
  {
    last_name: 'Гажев',
    first_name: 'Иван',
    middle_name: 'Евгеньевич',
    passport: '1417 612175',
    snils: '123-456-789 05',
    phone: '+7 (999) 856 99 79',
    email: 'gazhev@company.ru',
    birth_date: '1990-01-18',
    registration_address: 'г. Москва ул. Ленина д. 25 кв. 40',
    department_id: 4,
    position_id: 2,
    hire_date: '2021-02-10',
    salary: 70000,
    status: 'active'
  },
  
  // HR Specialists (4)
  {
    last_name: 'Зотова',
    first_name: 'Елена',
    middle_name: 'Дмитриевна',
    passport: '1417 612176',
    snils: '123-456-789 06',
    phone: '+7 (999) 856 99 80',
    email: 'zotova@company.ru',
    birth_date: '1992-04-12',
    registration_address: 'г. Москва ул. Пушкина д. 8 кв. 15',
    department_id: 2,
    position_id: 3,
    hire_date: '2022-01-10',
    salary: 45000,
    status: 'active'
  },
  {
    last_name: 'Иванов',
    first_name: 'Иван',
    middle_name: 'Степанович',
    passport: '1417 612177',
    snils: '123-456-789 07',
    phone: '+7 (999) 856 99 81',
    email: 'ivanov.i@company.ru',
    birth_date: '1995-06-25',
    registration_address: 'г. Москва ул. Гагарина д. 12 кв. 22',
    department_id: 2,
    position_id: 3,
    hire_date: '2021-09-01',
    salary: 45000,
    status: 'active'
  },
  {
    last_name: 'Морсов',
    first_name: 'Олег',
    middle_name: 'Викторович',
    passport: '1417 612178',
    snils: '123-456-789 08',
    phone: '+7 (999) 856 99 82',
    email: 'morsov@company.ru',
    birth_date: '1988-09-30',
    registration_address: 'г. Москва ул. Кирова д. 18 кв. 33',
    department_id: 2,
    position_id: 3,
    hire_date: '2020-11-15',
    salary: 45000,
    status: 'active'
  },
  {
    last_name: 'Иванов',
    first_name: 'Олег',
    middle_name: 'Петрович',
    passport: '1417 612179',
    snils: '123-456-789 09',
    phone: '+7 (999) 856 99 83',
    email: 'ivanov.o@company.ru',
    birth_date: '1993-12-08',
    registration_address: 'г. Москва ул. Мира д. 22 кв. 44',
    department_id: 2,
    position_id: 3,
    hire_date: '2022-03-20',
    salary: 45000,
    status: 'active'
  },
];

// Generate 23 more regular employees
const lastNames = ['Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров', 'Павлов'];
const firstNames = ['Александр', 'Дмитрий', 'Сергей', 'Андрей', 'Алексей', 'Николай', 'Владимир', 'Михаил', 'Игорь', 'Артем'];
const middleNames = ['Александрович', 'Дмитриевич', 'Сергеевич', 'Андреевич', 'Алексеевич', 'Николаевич', 'Владимирович', 'Михайлович', 'Игоревич', 'Артемович'];

for (let i = 0; i < 23; i++) {
  const deptId = [1, 3, 4][i % 3];
  const posId = [4, 5, 6, 7][i % 4];
  const salary = posId === 4 ? 60000 : posId === 5 ? 40000 : posId === 6 ? 35000 : 40000;
  
  let status = 'active';
  if (i === 5) status = 'vacation';
  if (i === 10) status = 'sick';
  if (i === 15) status = 'dismissed';
  if (i === 20) status = 'dismissed';
  
  employees.push({
    last_name: lastNames[i % lastNames.length],
    first_name: firstNames[i % firstNames.length],
    middle_name: middleNames[i % middleNames.length],
    passport: `1417 612${String(180 + i).padStart(3, '0')}`,
    snils: `123-456-${String(790 + i).padStart(3, '0')} ${String(i + 10).padStart(2, '0')}`,
    phone: `+7 (999) 856 ${String(90 + Math.floor(i/10)).padStart(2, '0')} ${String(80 + i%10).padStart(2, '0')}`,
    email: `${lastNames[i % lastNames.length].toLowerCase()}${i}@company.ru`,
    birth_date: `${1985 + (i % 10)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    registration_address: `г. Москва ул. Примерная д. ${i + 1} кв. ${i * 10}`,
    department_id: deptId,
    position_id: posId,
    hire_date: `${2020 + (i % 4)}-${String(1 + (i % 12)).padStart(2, '0')}-15`,
    salary: salary,
    status
  });
}

async function seed() {

  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM vacation_requests');
    await pool.query('DELETE FROM careers');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM roles');
    await pool.query('DELETE FROM career_types');
    await pool.query('DELETE FROM employees');
    await pool.query('DELETE FROM positions');
    await pool.query('DELETE FROM departments');
    
    // Reset sequences
    await pool.query('ALTER SEQUENCE departments_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE positions_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE employees_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE career_types_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE roles_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE vacation_requests_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE careers_id_seq RESTART WITH 1');

    // Insert departments
    for (const dept of departments) {
      await pool.query(
        'INSERT INTO departments (id, name, code) VALUES ($1, $2, $3)',
        [dept.id, dept.name, dept.code]
      );
    }
    console.log('✅ Departments inserted');

    // Insert positions
    for (const pos of positions) {
      await pool.query(
        'INSERT INTO positions (id, title, code, base_salary) VALUES ($1, $2, $3, $4)',
        [pos.id, pos.title, pos.code, pos.base_salary]
      );
    }
    console.log('✅ Positions inserted');

    // Insert roles
    for (const role of roles) {
      await pool.query(
        'INSERT INTO roles (id, name) VALUES ($1, $2)',
        [role.id, role.name]
      );
    }
    console.log('✅ Roles inserted');

      // Insert career types
    for (const type of careerTypes) {
      await pool.query(
        'INSERT INTO career_types (id, name) VALUES ($1, $2)',
        [type.id, type.name]
      );
    }
    console.log('✅ Career Types inserted');

    // Insert employees
    for (const emp of employees) {
      await pool.query(
        `INSERT INTO employees (
          last_name, first_name, middle_name, passport, snils, phone, email,
          birth_date, registration_address, department_id, position_id,
          hire_date, salary, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          emp.last_name, emp.first_name, emp.middle_name, emp.passport,
          emp.snils, emp.phone, emp.email, emp.birth_date,
          emp.registration_address, emp.department_id, emp.position_id,
          emp.hire_date, emp.salary, emp.status
        ]
      );      
    }
    console.log('✅ Employees inserted');

  

  // Хеш пароля 'admin' (генерируется через bcrypt.hashSync('admin', 10))
  const adminHash = await bcrypt.hash('admin', 10); 
  await pool.query(
    "INSERT INTO users (login, password_hash, role_id, employee_id) VALUES ($1, $2, $3, $4)",
    ['admin', adminHash, 1, 1]
  );
  for (let i = 0; i < 4; i++) {
    await pool.query(
      "INSERT INTO users (login, password_hash, role_id, employee_id) VALUES ($1, $2, $3, $4)",
      [`head${i}`, adminHash, 2, i + 2]
    );
  };
  for (let i = 0; i < 4; i++) {
    await pool.query(
      "INSERT INTO users (login, password_hash, role_id, employee_id) VALUES ($1, $2, $3, $4)",
      [`hr${i}`, adminHash, 3, i + 6]
    );
  };
  for (let i = 9; i < employees.length; i++) {
    await pool.query(
      "INSERT INTO users (login, password_hash, role_id, employee_id) VALUES ($1, $2, $3, $4)",
      [`common${i}`, adminHash, 5, i + 1]
    );
  };
  console.log('✅ Users inserted');

  // Seed careers
  const careers = [
    { employee_id: 2, type_id: 1, order_date: '2021-06-15', basis: 'Приказ №1 от 15.06.2021' },
    { employee_id: 3, type_id: 1, order_date: '2020-03-01', basis: 'Приказ №5 от 01.03.2020' },
    { employee_id: 4, type_id: 1, order_date: '2019-08-20', basis: 'Приказ №12 от 20.08.2019' },
    { employee_id: 5, type_id: 1, order_date: '2021-02-10', basis: 'Приказ №3 от 10.02.2021' },
    { employee_id: 6, type_id: 1, order_date: '2022-01-10', basis: 'Приказ №1 от 10.01.2022' },
    { employee_id: 10, type_id: 2, order_date: '2023-03-15', basis: 'Приказ №15 от 15.03.2023 — перевод на старшего разработчика' },
    { employee_id: 12, type_id: 3, order_date: '2023-06-01', basis: 'Сертификат AWS Solutions Architect' },
    { employee_id: 14, type_id: 4, order_date: '2023-12-20', basis: 'Лучший сотрудник года' },
    { employee_id: 16, type_id: 5, order_date: '2024-01-15', basis: 'Приказ №2 от 15.01.2024 — перевод из Sales в IT' },
    { employee_id: 18, type_id: 2, order_date: '2024-02-01', basis: 'Приказ №8 от 01.02.2024 — назначение ведущим бухгалтером' },
    { employee_id: 20, type_id: 3, order_date: '2024-04-10', basis: 'Курсы повышения квалификации 1С' },
    { employee_id: 22, type_id: 1, order_date: '2024-05-20', basis: 'Приказ №25 от 20.05.2024' },
  ];

  for (const career of careers) {
    await pool.query(
      `INSERT INTO careers (employee_id, type_id, order_date, basis) VALUES ($1, $2, $3, $4)`,
      [career.employee_id, career.type_id, career.order_date, career.basis]
    );
  }
  console.log('✅ Careers inserted');

  // Seed vacation requests (расширенный набор для графика по месяцам)
  const vacationRequests = [
    { employee_id: 6, start_date: '2024-01-15', end_date: '2024-01-28', type: 'annual', status: 'ordered', comment: '' },
    { employee_id: 7, start_date: '2024-02-01', end_date: '2024-02-14', type: 'annual', status: 'approved', comment: '' },
    { employee_id: 8, start_date: '2024-03-10', end_date: '2024-03-24', type: 'annual', status: 'ordered', comment: '' },
    { employee_id: 10, start_date: '2024-04-01', end_date: '2024-04-14', type: 'annual', status: 'approved', comment: '' },
    { employee_id: 12, start_date: '2024-05-20', end_date: '2024-06-02', type: 'annual', status: 'ordered', comment: '' },
    { employee_id: 14, start_date: '2024-06-15', end_date: '2024-06-28', type: 'annual', status: 'approved', comment: '' },
    { employee_id: 15, start_date: '2024-07-01', end_date: '2024-07-14', type: 'annual', status: 'approved', comment: '' },
    { employee_id: 18, start_date: '2024-07-15', end_date: '2024-07-28', type: 'annual', status: 'pending', comment: '' },
    { employee_id: 20, start_date: '2024-08-01', end_date: '2024-08-14', type: 'unpaid', status: 'pending', comment: 'Семейные обстоятельства' },
    { employee_id: 22, start_date: '2024-09-01', end_date: '2024-09-14', type: 'annual', status: 'rejected', comment: '', rejection_reason: 'Высокая загрузка' },
    { employee_id: 9, start_date: '2024-04-10', end_date: '2024-04-20', type: 'sick', status: 'approved', comment: '' },
    { employee_id: 11, start_date: '2024-05-05', end_date: '2024-05-15', type: 'sick', status: 'approved', comment: '' },
    { employee_id: 13, start_date: '2024-03-01', end_date: '2024-03-14', type: 'maternity', status: 'ordered', comment: '' },
  ];

  for (const vr of vacationRequests) {
    await pool.query(
      `INSERT INTO vacation_requests (employee_id, start_date, end_date, type, status, comment, approver_id, approval_date, rejection_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        vr.employee_id, vr.start_date, vr.end_date, vr.type, vr.status,
        vr.comment || null,
        (vr.status === 'approved' || vr.status === 'ordered' || vr.status === 'rejected') ? 2 : null,
        (vr.status === 'approved' || vr.status === 'ordered') ? new Date().toISOString() : null,
        vr.rejection_reason || null
      ]
    );
  }
  console.log('✅ Vacation requests inserted');

  // Seed orders
  const orders = [
    {
      order_number: 'П-001',
      order_date: '2024-01-10',
      type: 'vacation',
      employee_id: 6,
      vacation_request_id: 1,
      content: 'Предоставить ежегодный оплачиваемый отпуск сотруднику Зотовой Е.Д. сроком с 15.01.2024 по 28.01.2024.',
      signed_by: 'Петрова Л.О.',
      created_by: 3
    },
    {
      order_number: 'П-002',
      order_date: '2024-03-05',
      type: 'vacation',
      employee_id: 8,
      vacation_request_id: 3,
      content: 'Предоставить ежегодный оплачиваемый отпуск сотруднику Морсову О.В. сроком с 10.03.2024 по 24.03.2024.',
      signed_by: 'Петрова Л.О.',
      created_by: 3
    },
    {
      order_number: 'П-003',
      order_date: '2024-05-15',
      type: 'vacation',
      employee_id: 12,
      vacation_request_id: 5,
      content: 'Предоставить ежегодный оплачиваемый отпуск сотруднику Смирнову А.А. сроком с 20.05.2024 по 02.06.2024.',
      signed_by: 'Петрова Л.О.',
      created_by: 3
    },
    {
      order_number: 'П-004',
      order_date: '2024-02-25',
      type: 'vacation',
      employee_id: 13,
      vacation_request_id: 13,
      content: 'Предоставить отпуск по беременности и родам сотруднице Кузнецовой.',
      signed_by: 'Петрова Л.О.',
      created_by: 3
    },
  ];

  for (const order of orders) {
    await pool.query(
      `INSERT INTO orders (order_number, order_date, type, employee_id, vacation_request_id, content, signed_by, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        order.order_number, order.order_date, order.type, order.employee_id,
        order.vacation_request_id, order.content, order.signed_by, order.created_by
      ]
    );
  }
  console.log('✅ Orders inserted');


    console.log(`🎉 Seeding completed! Total employees: ${employees.length}`);
    console.log('   - Administrator: 1');
    console.log('   - Department Heads: 4');
    console.log('   - HR Specialists: 4');
    console.log('   - Regular Employees: 23');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
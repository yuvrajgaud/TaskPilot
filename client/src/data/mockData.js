import { dateFromToday } from '../lib/dates'

/*
  Demo data for Task 1. Due dates are generated relative to today so the
  dashboard always shows a realistic spread of overdue, urgent and on-track
  work rather than a wall of stale dates.

  Shape note: these objects match the response shape the Task 2 REST API will
  return, so wiring the real backend later is a change to lib/api.js only —
  no component has to be touched.
*/

export const currentUser = {
  id: 'u_1',
  name: 'Yuvraj Gaud',
  initials: 'YG',
  email: 'yuvrajgaud28@gmail.com',
  programme: 'B.Tech Computer Engineering',
  term: 'Semester 5',
}

export const courses = [
  {
    id: 'c_1',
    code: 'CS201',
    title: 'Data Structures & Algorithms',
    instructor: 'Dr. R. Kulkarni',
    credits: 4,
  },
  {
    id: 'c_2',
    code: 'MA202',
    title: 'Linear Algebra',
    instructor: 'Prof. S. Iyer',
    credits: 3,
  },
  {
    id: 'c_3',
    code: 'CS204',
    title: 'Database Management Systems',
    instructor: 'Dr. A. Menon',
    credits: 4,
  },
  {
    id: 'c_4',
    code: 'HS101',
    title: 'Technical Communication',
    instructor: 'Ms. P. Deshpande',
    credits: 2,
  },
]

export const tasks = [
  {
    id: 't_1',
    courseId: 'c_1',
    title: 'Implement AVL tree rotations',
    status: 'in-progress',
    priority: 'high',
    dueDate: dateFromToday(1),
  },
  {
    id: 't_2',
    courseId: 'c_1',
    title: 'Lab report — graph traversal timings',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(-2),
  },
  {
    id: 't_3',
    courseId: 'c_1',
    title: 'Read Cormen ch. 12',
    status: 'done',
    priority: 'low',
    dueDate: dateFromToday(-5),
  },
  {
    id: 't_4',
    courseId: 'c_2',
    title: 'Problem set 6 — eigenvalues',
    status: 'todo',
    priority: 'high',
    dueDate: dateFromToday(4),
  },
  {
    id: 't_5',
    courseId: 'c_2',
    title: 'Revise Gram-Schmidt before quiz',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(11),
  },
  {
    id: 't_6',
    courseId: 'c_3',
    title: 'Normalise the library schema to 3NF',
    status: 'in-progress',
    priority: 'high',
    dueDate: dateFromToday(2),
  },
  {
    id: 't_7',
    courseId: 'c_3',
    title: 'Write 8 join queries for the practical',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(6),
  },
  {
    id: 't_8',
    courseId: 'c_3',
    title: 'ER diagram for the hostel project',
    status: 'done',
    priority: 'medium',
    dueDate: dateFromToday(-8),
  },
  {
    id: 't_9',
    courseId: 'c_4',
    title: 'Draft 2000-word report on renewable policy',
    status: 'todo',
    priority: 'high',
    dueDate: dateFromToday(9),
  },
  {
    id: 't_10',
    courseId: 'c_4',
    title: 'Peer review two classmate drafts',
    status: 'todo',
    priority: 'low',
    dueDate: dateFromToday(13),
  },
  {
    id: 't_11',
    courseId: 'c_1',
    title: 'Debug segment tree lazy propagation',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(7),
  },
  {
    id: 't_12',
    courseId: 'c_2',
    title: 'Submit tutorial sheet 4',
    status: 'done',
    priority: 'low',
    dueDate: dateFromToday(-3),
  },
]

export const activity = [
  { id: 'a_1', text: 'Marked "Submit tutorial sheet 4" as done', at: '2h ago' },
  { id: 'a_2', text: 'Added 3 tasks to Database Management Systems', at: '5h ago' },
  { id: 'a_3', text: 'Moved "Normalise the library schema" to in progress', at: 'Yesterday' },
  { id: 'a_4', text: 'Created course Technical Communication', at: '2 days ago' },
]

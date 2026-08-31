/*
  The seed data the API starts with. It mirrors client/src/data/mockData.js so
  the frontend sees the same world whether it is running on mock data (Task 1)
  or against this API (Task 4).

  Due dates are generated relative to today, exactly as the client does, so the
  deadline spread stays realistic no matter when the server is started rather
  than decaying into a wall of past dates.
*/

const DAY_MS = 24 * 60 * 60 * 1000

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** An ISO timestamp `offset` days from midnight today. Matches the client. */
export function dateFromToday(offset) {
  return new Date(startOfToday().getTime() + offset * DAY_MS).toISOString()
}

export const seedUser = {
  id: 'u_1',
  name: 'Yuvraj Gaud',
  initials: 'YG',
  email: 'yuvrajgaud28@gmail.com',
  programme: 'B.Tech Computer Engineering',
  term: 'Semester 5',
}

export const seedCourses = [
  { id: 'c_1', code: 'CS201', title: 'Data Structures & Algorithms', instructor: 'Dr. R. Kulkarni', credits: 4 },
  { id: 'c_2', code: 'MA202', title: 'Linear Algebra', instructor: 'Prof. S. Iyer', credits: 3 },
  { id: 'c_3', code: 'CS204', title: 'Database Management Systems', instructor: 'Dr. A. Menon', credits: 4 },
  { id: 'c_4', code: 'HS101', title: 'Technical Communication', instructor: 'Ms. P. Deshpande', credits: 2 },
]

export const seedTasks = [
  {
    id: 't_1',
    courseId: 'c_1',
    title: 'Implement AVL tree rotations',
    status: 'in-progress',
    priority: 'high',
    dueDate: dateFromToday(1),
    description:
      'Implement left, right, and both double rotations so the tree rebalances on insert and delete. Add a height-check assertion after each operation to catch imbalance early.',
  },
  {
    id: 't_2',
    courseId: 'c_1',
    title: 'Lab report — graph traversal timings',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(-2),
    description:
      'Benchmark BFS and DFS across the provided graph set and write up the timing comparison, with a short analysis of why the results differ by graph shape.',
  },
  {
    id: 't_3',
    courseId: 'c_1',
    title: 'Read Cormen ch. 12',
    status: 'done',
    priority: 'low',
    dueDate: dateFromToday(-5),
    description:
      'Read the binary search tree chapter and note the invariants before the AVL lecture.',
  },
  {
    id: 't_4',
    courseId: 'c_2',
    title: 'Problem set 6 — eigenvalues',
    status: 'todo',
    priority: 'high',
    dueDate: dateFromToday(4),
    description:
      'Work through problems 1–8 on eigenvalues and eigenvectors, showing the characteristic polynomial for each matrix.',
  },
  {
    id: 't_5',
    courseId: 'c_2',
    title: 'Revise Gram-Schmidt before quiz',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(11),
    description:
      'Re-derive the Gram–Schmidt process by hand on a three-vector example ahead of Friday’s quiz.',
  },
  {
    id: 't_6',
    courseId: 'c_3',
    title: 'Normalise the library schema to 3NF',
    status: 'in-progress',
    priority: 'high',
    dueDate: dateFromToday(2),
    description:
      'Take the library schema from 1NF through to 3NF, listing the functional dependency removed at each step.',
  },
  {
    id: 't_7',
    courseId: 'c_3',
    title: 'Write 8 join queries for the practical',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(6),
    description:
      'Write the eight join queries from the practical sheet — inner, left, right, and full outer — against the sample database.',
  },
  {
    id: 't_8',
    courseId: 'c_3',
    title: 'ER diagram for the hostel project',
    status: 'done',
    priority: 'medium',
    dueDate: dateFromToday(-8),
    description:
      'Draw the entity-relationship diagram for the hostel allocation project, including cardinalities and any weak entities.',
  },
  {
    id: 't_9',
    courseId: 'c_4',
    title: 'Draft 2000-word report on renewable policy',
    status: 'todo',
    priority: 'high',
    dueDate: dateFromToday(9),
    description:
      'Draft the 2000-word report on national renewable energy policy with at least six cited sources.',
  },
  {
    id: 't_10',
    courseId: 'c_4',
    title: 'Peer review two classmate drafts',
    status: 'todo',
    priority: 'low',
    dueDate: dateFromToday(13),
    description:
      'Read two classmates’ report drafts and leave structured feedback on argument and evidence.',
  },
  {
    id: 't_11',
    courseId: 'c_1',
    title: 'Debug segment tree lazy propagation',
    status: 'todo',
    priority: 'medium',
    dueDate: dateFromToday(7),
    description:
      'Track down why range updates aren’t propagating, add a failing test case that reproduces it, then fix the lazy push-down.',
  },
  {
    id: 't_12',
    courseId: 'c_2',
    title: 'Submit tutorial sheet 4',
    status: 'done',
    priority: 'low',
    dueDate: dateFromToday(-3),
    description: 'Final check and submit tutorial sheet 4 on the course portal.',
  },
]

export const seedActivity = [
  { id: 'a_1', text: 'Marked "Submit tutorial sheet 4" as done', at: '2h ago' },
  { id: 'a_2', text: 'Added 3 tasks to Database Management Systems', at: '5h ago' },
  { id: 'a_3', text: 'Moved "Normalise the library schema" to in progress', at: 'Yesterday' },
  { id: 'a_4', text: 'Created course Technical Communication', at: '2 days ago' },
]

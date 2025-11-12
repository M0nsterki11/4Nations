// helper: row,col → index
const idx = (r, c) => r * 30 + c;

// Put do centra za kvartant 1 (Vjetar, top-left)
export const path1 = [
  idx(0,0), idx(1,1), idx(2,1), idx(3,1), idx(4,2), idx(4,3), idx(4,4), idx(3,5), idx(2,6), idx(2,7),
  idx(2,8), idx(2,9), idx(3,9), idx(4,8), idx(5,7), idx(5,6), idx(5,5), idx(6,4), idx(7,5), idx(8,4),
  idx(9,4), idx(10,4), idx(10,5), idx(10,6), idx(9,7), idx(8,8), idx(7,8), idx(6,9), idx(6,10), idx(7,11),
  idx(7,11), idx(8,12), idx(9,12), idx(10,11), idx(11,10), idx(12,9), idx(13,10), idx(12,11), idx(12,12), 
  idx(13,13), idx(14,14),
];

// Za kvartant 2 (Zemlja, top-right)
export const path2 = [
  idx(0,29), idx(0,28), idx(0,27), idx(1,26), idx(2,25), idx(1,24), idx(1,23), idx(2,22), idx(3,23), idx(4,24),
  idx(5,25), idx(5,26), idx(6,26), idx(7,26), idx(7,25), idx(7,24), idx(7,23), idx(6,22), idx(5,22), idx(4,21),
  idx(4,20), idx(3,19), idx(4,18), idx(4,17), idx(4,16), idx(5,15), idx(6,16), idx(6,17), idx(7,17), idx(8,18),
  idx(9,19), idx(9,20), idx(9,21), idx(10,22), idx(11,21), idx(11,20), idx(12,19), idx(12,18), idx(13,18), idx(13,17),
  idx(13,16), idx(14,15), 
];

// Kvartant 3 (Vatra, bottom-right)
export const path3 = [
  idx(29,29), idx(28,29), idx(28,28), idx(28,27), idx(28,26), idx(27,26), idx(26,26), idx(26,27), idx(26,28), idx(25,28),
  idx(24,28), idx(24,27), idx(24,26), idx(24,25), idx(24,24), idx(25,23), idx(25,22), idx(25,21), idx(25,21), idx(25,20),
  idx(24,20), idx(23,20), idx(22,21), idx(22,22), idx(22,23), idx(21,24), idx(20,25), idx(19,24), idx(18,23), idx(18,22), 
  idx(18,21), idx(19,20), idx(19,19), idx(20,19), idx(21,18), idx(20,17), idx(19,17), idx(18,18), idx(17,17), idx(17,16),
  idx(16,16), idx(15,15),
];

// Kvartant 4 (Voda, bottom-left)
export const path4 = [
  idx(29,0), idx(28,0), idx(27,0), idx(26,0), idx(25,0), idx(25,1), idx(26,2), idx(27,3), idx(26,4), idx(27,5),
  idx(26,6), idx(25,6), idx(24,5), idx(23,4), idx(23,3), idx(22,3), idx(21,3), idx(21,4), idx(22,5), idx(22,6),
  idx(23,7), idx(23,8), idx(22,8), idx(21,8), idx(20,8), idx(20,9), idx(20,10), idx(21,11), idx(22,12), idx(21,12),
  idx(20,12), idx(19,12), idx(18,11), idx(18,10), idx(18,9), idx(17,9), idx(16,9), idx(15,10), idx(16,11), idx(16,12),
  idx(16,13), idx(15,14), 
];

// Grupiрамо ih u objekt za lakši pristup:
export const paths = { 1: path1, 2: path2, 3: path3, 4: path4 };
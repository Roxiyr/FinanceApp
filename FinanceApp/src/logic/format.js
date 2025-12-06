/**
 * Format angka ke format Rupiah
 * @param {number} num - Angka yang akan diformat
 * @returns {string} Format Rp X.XXX.XXX
 */
export function formatRp(num) {
  if (!num && num !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format tanggal ke format Indonesia
 * @param {string} dateStr - Tanggal dalam format YYYY-MM-DD
 * @returns {string} Format DD MMM YYYY (e.g. 15 Des 2024)
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

/**
 * Format tanggal ke format pendek Indonesia
 * @param {string} dateStr - Tanggal dalam format YYYY-MM-DD
 * @returns {string} Format DD/MM/YYYY
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format persentase
 * @param {number} num - Angka persentase
 * @param {number} decimals - Jumlah decimal places (default 1)
 * @returns {string} Format X.X%
 */
export function formatPercent(num, decimals = 1) {
  if (!num && num !== 0) return '0%';
  return `${num.toFixed(decimals)}%`;
}

/**
 * Hitung persentase dari dua angka
 * @param {number} part - Bagian
 * @param {number} total - Total
 * @returns {number} Persentase
 */
export function calculatePercent(part, total) {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Bulatkan angka
 * @param {number} num - Angka
 * @param {number} decimals - Decimal places (default 0)
 * @returns {number} Angka yang dibulatkan
 */
export function roundNumber(num, decimals = 0) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Validasi input angka positif
 * @param {string|number} value - Nilai input
 * @returns {boolean} True jika valid
 */
export function isValidAmount(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}
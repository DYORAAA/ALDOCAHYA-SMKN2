// JavaScript untuk fungsionalitas
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('input-form');
            const dateInput = document.getElementById('date');
            const descriptionInput = document.getElementById('description');
            const amountInput = document.getElementById('amount');
            const expenseList = document.getElementById('expense-list');
            const totalAmountSpan = document.getElementById('total-amount');

            let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

            // Atur tanggal hari ini secara default
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;

            // Fungsi untuk menyimpan data ke Local Storage
            const saveExpenses = () => {
                localStorage.setItem('expenses', JSON.stringify(expenses));
            };

            // Fungsi untuk memformat angka menjadi mata uang Rupiah
            const formatRupiah = (number) => {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(number);
            };

            // Fungsi untuk menghitung dan menampilkan total
            const renderTotal = () => {
                const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                totalAmountSpan.textContent = formatRupiah(total);
            };

            // Fungsi untuk menampilkan daftar pengeluaran
            const renderExpenses = () => {
                // Urutkan berdasarkan tanggal terbaru
                expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                expenseList.innerHTML = '';
                expenses.forEach((expense, index) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <div class="expense-info">
                            <strong>${formatRupiah(expense.amount)}</strong>
                            <span>${expense.description} (${expense.date})</span>
                        </div>
                        <button class="delete-btn" data-index="${index}">Hapus</button>
                    `;
                    expenseList.appendChild(listItem);
                });

                renderTotal();
                
                // Tambahkan event listener untuk tombol hapus
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deleteExpense);
                });
            };

            // Fungsi untuk menambahkan pengeluaran baru
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newExpense = {
                    id: Date.now(), // ID unik
                    date: dateInput.value,
                    description: descriptionInput.value.trim(),
                    amount: parseFloat(amountInput.value)
                };

                expenses.push(newExpense);
                saveExpenses();
                renderExpenses();

                // Bersihkan form
                descriptionInput.value = '';
                amountInput.value = '';
                dateInput.value = today; // Kembalikan ke tanggal hari ini
            });

            // Fungsi untuk menghapus pengeluaran
            const deleteExpense = (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                
                // Karena kita mengurutkan array sebelum merender, kita perlu menghapus item berdasarkan data yang dirender.
                // Cara yang lebih aman adalah menghapus berdasarkan ID unik
                const expenseToDelete = expenses[index];
                
                // Cari index item yang sebenarnya berdasarkan ID sebelum diurutkan.
                // Walaupun di contoh ini kita hapus berdasarkan index hasil sort
                // Cara yang lebih baik untuk aplikasi yang lebih kompleks adalah:
                // expenses = expenses.filter(expense => expense.id !== expenseToDelete.id);
                
                expenses.splice(index, 1);
                saveExpenses();
                renderExpenses();
            };

            // Muat dan tampilkan data saat halaman pertama kali dimuat
            renderExpenses();
        });
        // Ambil elemen tombol unduh
            const downloadBtn = document.getElementById('download-btn');

            // Fungsi untuk mengubah data array menjadi format CSV
            const convertToCSV = (arr) => {
                const header = ['Tanggal', 'Deskripsi', 'Jumlah'];
                const csvRows = [];
                
                // Tambahkan header
                csvRows.push(header.join(';')); // Gunakan semicolon (;) untuk kompatibilitas Excel Indonesia

                // Tambahkan baris data
                for (const row of arr) {
                    const values = [
                        row.date,
                        // Pastikan deskripsi tidak mengandung semicolon (;) yang merusak format CSV
                        `"${row.description.replace(/"/g, '""')}"`, 
                        row.amount // Angka tanpa format Rupiah agar bisa dihitung di Excel
                    ];
                    csvRows.push(values.join(';'));
                }

                return csvRows.join('\n');
            };

            // Fungsi untuk memicu pengunduhan
            const downloadCSV = () => {
                if (expenses.length === 0) {
                    alert('Tidak ada data pengeluaran untuk diunduh.');
                    return;
                }
                
                const csvString = convertToCSV(expenses);
                
                // Membuat Blob dan URL untuk file yang akan diunduh
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                
                // Membuat link tersembunyi dan mengklik link tersebut
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                
                // Tentukan nama file
                const today = new Date().toISOString().split('T')[0];
                a.setAttribute('download', `pengeluaran_${today}.csv`);
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            // Tambahkan event listener ke tombol unduh
            downloadBtn.addEventListener('click', downloadCSV);
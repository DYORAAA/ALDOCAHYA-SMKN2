<script>
        // JavaScript untuk fungsionalitas
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('input-form');
            const dateInput = document.getElementById('date');
            const descriptionInput = document.getElementById('description');
            const amountInput = document.getElementById('amount');
            const expenseList = document.getElementById('expense-list');
            const totalAmountSpan = document.getElementById('total-amount');
            const downloadBtn = document.getElementById('download-btn'); // Ambil tombol unduh

            let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

            // Atur tanggal hari ini secara default
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;

            // Fungsi untuk menyimpan data ke Local Storage
            const saveExpenses = () => {
                localStorage.setItem('expenses', JSON.stringify(expenses));
            };

            // Fungsi untuk memformat angka menjadi mata uang Rupiah (Hanya untuk Tampilan)
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
                
                document.querySelectorAll('.delete-btn').forEach(button => {
                    // Gunakan event listener yang baru dibuat untuk menghindari masalah 'stale closure'
                    button.addEventListener('click', deleteExpense); 
                });
            };

            // Fungsi untuk menambahkan pengeluaran baru
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newExpense = {
                    id: Date.now(),
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
                dateInput.value = today;
            });

            // Fungsi untuk menghapus pengeluaran
            const deleteExpense = (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                expenses.splice(index, 1);
                saveExpenses();
                renderExpenses();
            };
            
            // --- FITUR UNDUH CSV YANG DIPERBAIKI ---

            // Fungsi untuk mengubah data array menjadi format CSV
            const convertToCSV = (arr) => {
                // Header (Kolom)
                const header = ['Tanggal', 'Deskripsi', 'Jumlah'];
                const csvRows = [];
                
                // Tambahkan header, dipisahkan oleh semicolon (;)
                csvRows.push(header.join(';')); 

                // Tambahkan baris data
                for (const row of arr) {
                    const description_clean = `"${row.description.replace(/"/g, '""')}"`;
                    
                    const values = [
                        row.date,
                        description_clean,
                        // Angka tanpa format Rupiah agar bisa dihitung di Excel
                        row.amount 
                    ];
                    csvRows.push(values.join(';'));
                }

                return csvRows.join('\n');
            };

                // Fungsi untuk memicu pengunduhan (Menggunakan Blob)
            const downloadCSV = () => {
                if (expenses.length === 0) {
                    alert('Tidak ada data pengeluaran untuk diunduh.');
                    return;
                }
                
                const csvString = convertToCSV(expenses);
                
                // 1. Buat Blob dengan tipe text/csv, termasuk BOM untuk Excel UTF-8
                const blob = new Blob(['\uFEFF' + csvString], { 
                    type: 'text/csv;charset=utf-8;' 
                });
                
                // 2. Buat URL dari Blob
                const url = URL.createObjectURL(blob);
                
                // 3. Buat link tersembunyi
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                
                // Tentukan nama file
                const todayFormatted = new Date().toISOString().split('T')[0];
                a.download = `pengeluaran_data_${todayFormatted}.csv`;
                
                // 4. Memicu klik
                document.body.appendChild(a);
                a.click();
                
                // 5. Bersihkan (penting untuk membebaskan memori)
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Hapus URL Blob dari memori browser
            };

            // Tambahkan event listener ke tombol unduh
            downloadBtn.addEventListener('click', downloadCSV);
                
                const csvString = convertToCSV(expenses);
                
                // Menggunakan URI Data untuk pengunduhan (lebih simpel)
                // Menggunakan tipe data text/csv dan encoding UTF-8 untuk mendukung karakter khusus
                const dataUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvString);
                
                // Membuat link tersembunyi
                const a = document.createElement('a');
                a.style.display = 'none'; // Sembunyikan link
                a.href = dataUri;
                
                // Tentukan nama file
                const todayFormatted = new Date().toISOString().split('T')[0];
                a.download = `pengeluaran_data_${todayFormatted}.csv`;
                
                // Memicu klik dan menghapus elemen
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            // Tambahkan event listener ke tombol unduh
            downloadBtn.addEventListener('click', downloadCSV);

            // Muat dan tampilkan data saat halaman pertama kali dimuat
            renderExpenses();
        });
    </script>


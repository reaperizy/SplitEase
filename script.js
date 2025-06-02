document.addEventListener('DOMContentLoaded', () => {
    // Global state
    let people = [];
    let items = [];

    // DOM Elements
    const billNameInput = document.getElementById('bill-name');
    const personNameInput = document.getElementById('person-name');
    const addPersonBtn = document.getElementById('add-person-btn');
    const peopleListUl = document.getElementById('people-list');
    const itemNameInput = document.getElementById('item-name');
    const itemPriceInput = document.getElementById('item-price');
    const itemPayersListDiv = document.getElementById('item-payers-list');
    const addItemBtn = document.getElementById('add-item-btn');
    const itemsListUl = document.getElementById('items-list');

    // Additional Costs Section Elements
    const toggleAdditionalCostsBtn = document.getElementById('toggle-additional-costs-btn');
    const additionalCostsFieldsDiv = document.getElementById('additional-costs-fields');
    const toggleIcon = toggleAdditionalCostsBtn.querySelector('.toggle-icon'); 

    const taxPercentageInput = document.getElementById('tax-percentage');
    const serviceFeeInput = document.getElementById('service-fee');
    const discountAmountInput = document.getElementById('discount-amount');
    const additionalCostDistributionSelect = document.getElementById('additional-cost-distribution');
    
    const calculateBillBtn = document.getElementById('calculate-bill-btn');
    const resultsSectionDiv = document.getElementById('results-section');
    const billSummaryDiv = document.getElementById('bill-summary');
    const totalBillDisplayP = document.getElementById('total-bill-display');
    const copyResultsBtn = document.getElementById('copy-results-btn');
    const startNewBtn = document.getElementById('start-new-btn');
    const currentYearSpan = document.getElementById('currentYear');
    const printBtn = document.getElementById('print-btn');
    const saveImageBtn = document.getElementById('save-image-btn');

    // Initialize
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    renderItemPayersList(); 

    // --- Toggle for Additional Costs Section ---
    if (toggleAdditionalCostsBtn && additionalCostsFieldsDiv && toggleIcon) {
        toggleAdditionalCostsBtn.addEventListener('click', () => {
            const isExpanded = additionalCostsFieldsDiv.style.display === 'block';
            additionalCostsFieldsDiv.style.display = isExpanded ? 'none' : 'block';
            toggleAdditionalCostsBtn.setAttribute('aria-expanded', String(!isExpanded));
            toggleIcon.textContent = isExpanded ? '+' : '−'; 
        });
    }


    // --- Utility Functions ---
    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // --- People Management ---
    function addPerson() {
        const personName = sanitizeHTML(personNameInput.value.trim());
        if (personName === '') {
            alert('Nama orang tidak boleh kosong!');
            return;
        }
        if (people.find(p => p.name.toLowerCase() === personName.toLowerCase())) {
            alert('Nama orang sudah ada!');
            return;
        }

        const person = { id: Date.now(), name: personName };
        people.push(person);
        renderPeopleList();
        renderItemPayersList();
        personNameInput.value = '';
        personNameInput.focus();
    }

    function removePerson(personId) {
        people = people.filter(p => p.id !== personId);
        items.forEach(item => {
            item.payers = item.payers.filter(payerId => payerId !== personId);
        });
        renderPeopleList();
        renderItemPayersList();
        renderItemsList();
    }

    function renderPeopleList() {
        peopleListUl.innerHTML = '';
        people.forEach(person => {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = person.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'secondary'; // Added class for consistent styling
            removeBtn.textContent = 'Hapus';
            removeBtn.style.padding = '5px 10px'; 
            removeBtn.style.fontSize = '0.8em';
            removeBtn.onclick = () => removePerson(person.id);

            li.appendChild(nameSpan);
            li.appendChild(removeBtn);
            peopleListUl.appendChild(li);
        });
    }

    // --- Item Management ---
    function renderItemPayersList() {
        itemPayersListDiv.innerHTML = '';

        if (people.length === 0) {
            itemPayersListDiv.innerHTML = '<p><em>Tambahkan orang terlebih dahulu untuk memilih pembayar.</em></p>';
            return;
        }

        const selectAllContainer = document.createElement('div');
        selectAllContainer.style.marginBottom = '10px';
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = 'select-all-payers';
        selectAllCheckbox.checked = true;
        selectAllCheckbox.onchange = toggleAllPayers;

        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = 'select-all-payers';
        selectAllLabel.textContent = 'Pilih Semua/Batalkan Semua';
        selectAllLabel.style.fontWeight = 'bold';

        selectAllContainer.appendChild(selectAllCheckbox);
        selectAllContainer.appendChild(selectAllLabel);
        itemPayersListDiv.appendChild(selectAllContainer);

        people.forEach(person => {
            const div = document.createElement('div');
            div.className = 'person-checkbox-item-container';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `payer-${person.id}`;
            checkbox.value = person.id;
            checkbox.name = 'item-payer';
            checkbox.checked = true;

            const label = document.createElement('label');
            label.htmlFor = `payer-${person.id}`;
            label.textContent = person.name;

            div.appendChild(checkbox);
            div.appendChild(label);
            itemPayersListDiv.appendChild(div);
        });
    }

    function toggleAllPayers() {
        const selectAllCheckbox = document.getElementById('select-all-payers');
        const payerCheckboxes = document.querySelectorAll('input[name="item-payer"]');
        payerCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }

    function addItem() {
        const itemName = sanitizeHTML(itemNameInput.value.trim());
        const itemPrice = parseFloat(itemPriceInput.value);

        if (itemName === '') {
            alert('Nama item tidak boleh kosong!');
            return;
        }
        if (isNaN(itemPrice) || itemPrice <= 0) {
            alert('Harga item tidak valid!');
            return;
        }
        if (people.length === 0) {
            alert('Tambahkan orang terlebih dahulu sebelum menambahkan item!');
            return;
        }

        const selectedPayerCheckboxes = document.querySelectorAll('input[name="item-payer"]:checked');
        if (selectedPayerCheckboxes.length === 0) {
            alert('Pilih minimal satu orang yang membayar item ini!');
            return;
        }

        const payerIds = Array.from(selectedPayerCheckboxes).map(cb => parseInt(cb.value));

        const item = {
            id: Date.now(),
            name: itemName,
            price: itemPrice,
            payers: payerIds
        };
        items.push(item);
        renderItemsList();
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemNameInput.focus();
        document.querySelectorAll('input[name="item-payer"]').forEach(cb => cb.checked = true);
        const selectAllPayersCheckbox = document.getElementById('select-all-payers');
        if (selectAllPayersCheckbox) {
            selectAllPayersCheckbox.checked = true;
        }
    }

    function removeItem(itemId) {
        items = items.filter(item => item.id !== itemId);
        renderItemsList();
    }

    function renderItemsList() {
        itemsListUl.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li'); 
            const itemInfoDiv = document.createElement('div');
            const payerNames = item.payers.map(payerId => {
                const person = people.find(p => p.id === payerId);
                return person ? person.name : 'Unknown';
            }).join(', ');

            itemInfoDiv.innerHTML = `
                <strong>${item.name}</strong> - Rp ${item.price.toLocaleString('id-ID')}
                <br>
                <span class="item-details">Dibayar oleh: ${payerNames || 'Belum ada'}</span>
            `;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'secondary';
            removeBtn.textContent = 'Hapus';
            removeBtn.style.padding = '5px 10px';
            removeBtn.style.fontSize = '0.8em';
            removeBtn.onclick = () => removeItem(item.id);

            li.appendChild(itemInfoDiv);
            li.appendChild(removeBtn);
            itemsListUl.appendChild(li);
        });
    }

    // --- Calculation and Results ---
    function calculateBill() {
        if (people.length === 0) { alert('Tambahkan orang terlebih dahulu!'); return; }
        if (items.length === 0) { alert('Tambahkan item terlebih dahulu!'); return; }

        const taxPercentage = parseFloat(taxPercentageInput.value) || 0;
        const serviceFee = parseFloat(serviceFeeInput.value) || 0;
        const discountAmount = parseFloat(discountAmountInput.value) || 0;
        const additionalCostDistribution = additionalCostDistributionSelect.value;

        const personDetails = people.map(person => ({
            ...person,
            itemContributions: [],
            subtotalItems: 0,
            shareOfAdditionalCosts: 0,
            shareOfDiscount: 0,
            finalAmount: 0
        }));

        let totalItemsPriceSum = 0;
        items.forEach(item => {
            totalItemsPriceSum += item.price;
            if (item.payers.length > 0) {
                const pricePerPayerForItem = item.price / item.payers.length;
                item.payers.forEach(payerId => {
                    const person = personDetails.find(p => p.id === payerId);
                    if (person) {
                        person.itemContributions.push({
                            itemName: item.name,
                            itemFullPrice: item.price,
                            amountPaid: pricePerPayerForItem,
                            numPayers: item.payers.length
                        });
                        person.subtotalItems += pricePerPayerForItem;
                    }
                });
            }
        });

        const totalTaxAmount = (totalItemsPriceSum * taxPercentage) / 100;
        const totalAdditionalCosts = totalTaxAmount + serviceFee;

        if (totalAdditionalCosts > 0 && people.length > 0) {
            if (additionalCostDistribution === 'evenly') {
                const additionalCostPerPerson = totalAdditionalCosts / people.length;
                personDetails.forEach(person => {
                    person.shareOfAdditionalCosts = additionalCostPerPerson;
                });
            } else if (additionalCostDistribution === 'proportionally') {
                const sumOfAllSubtotalItems = personDetails.reduce((sum, p) => sum + p.subtotalItems, 0);
                if (sumOfAllSubtotalItems > 0) {
                    personDetails.forEach(person => {
                        const proportion = person.subtotalItems / sumOfAllSubtotalItems;
                        person.shareOfAdditionalCosts = totalAdditionalCosts * proportion;
                    });
                } else { 
                    const additionalCostPerPerson = totalAdditionalCosts / people.length;
                    personDetails.forEach(person => {
                        person.shareOfAdditionalCosts = additionalCostPerPerson;
                    });
                }
            }
        }

        personDetails.forEach(person => {
            person.finalAmount = person.subtotalItems + person.shareOfAdditionalCosts;
        });

        if (discountAmount > 0 && people.length > 0) {
            const totalBillBeforeApplyingDiscountThisStep = personDetails.reduce((sum, p) => sum + p.finalAmount, 0);
            if (totalBillBeforeApplyingDiscountThisStep > 0) { // Prevent division by zero or applying discount to a zero/negative bill
                 personDetails.forEach(person => {
                    // Distribute discount proportionally to their current bill amount
                    const proportionOfBill = person.finalAmount > 0 ? person.finalAmount / totalBillBeforeApplyingDiscountThisStep : (1 / people.length); // if person's amount is 0, distribute discount evenly
                    const discountForPerson = discountAmount * proportionOfBill;
                    person.shareOfDiscount = discountForPerson;
                    person.finalAmount -= discountForPerson;
                    person.finalAmount = Math.max(0, person.finalAmount); // Ensure not negative
                });
            }
        }
        
        // Round all monetary values for display
        personDetails.forEach(person => {
            person.itemContributions.forEach(contrib => {
                contrib.itemFullPrice = Math.round(contrib.itemFullPrice);
                contrib.amountPaid = Math.round(contrib.amountPaid);
            });
            person.subtotalItems = Math.round(person.subtotalItems);
            person.shareOfAdditionalCosts = Math.round(person.shareOfAdditionalCosts);
            person.shareOfDiscount = Math.round(person.shareOfDiscount);
            person.finalAmount = Math.round(person.finalAmount);
        });
        
        const finalGrandTotal = personDetails.reduce((sum, p) => sum + p.finalAmount, 0);

        displayResults(personDetails, finalGrandTotal);
    }

    function displayResults(personDetails, grandTotal) {
        billSummaryDiv.innerHTML = '';
        const billName = sanitizeHTML(billNameInput.value.trim()) || "Tagihan Tanpa Nama";

        const overallBillHeader = document.createElement('h3'); 
        overallBillHeader.textContent = `Rincian untuk: ${billName}`;
        overallBillHeader.style.marginBottom = '20px';
        overallBillHeader.style.textAlign = 'center';
        overallBillHeader.style.fontSize = '1.4em';
        overallBillHeader.style.color = '#2c3e50';
        billSummaryDiv.appendChild(overallBillHeader);

        if (personDetails.length === 0) {
            billSummaryDiv.innerHTML = '<p>Tidak ada orang untuk dihitung.</p>';
        }

        personDetails.forEach(person => {
            const personDiv = document.createElement('div');
            personDiv.className = 'person-payment-summary';

            const personHeaderDiv = document.createElement('div');
            personHeaderDiv.className = 'person-header';
            personHeaderDiv.innerHTML = `
                <h3>${person.name}</h3>
                <span class="person-total-final">TOTAL: Rp ${person.finalAmount.toLocaleString('id-ID')}</span>
            `;
            personDiv.appendChild(personHeaderDiv);

            const breakdownDiv = document.createElement('div');
            breakdownDiv.className = 'payment-breakdown';

            if (person.itemContributions.length > 0) {
                const itemsHeader = document.createElement('h4');
                itemsHeader.textContent = 'Kontribusi Item:';
                breakdownDiv.appendChild(itemsHeader);
                const itemsUl = document.createElement('ul');
                itemsUl.className = 'item-contribution-list';
                person.itemContributions.forEach(contrib => {
                    const itemLi = document.createElement('li');
                    itemLi.innerHTML = `
                        <span class="item-name-price">${contrib.itemName} (Harga Penuh: Rp ${contrib.itemFullPrice.toLocaleString('id-ID')})</span>
                        <br>
                        <span class="item-share">↳ Anda bayar: Rp ${contrib.amountPaid.toLocaleString('id-ID')} 
                        <span class="num-payers">(${contrib.numPayers > 1 ? `dari ${contrib.numPayers} org` : 'sendiri'})</span></span>
                    `;
                    itemsUl.appendChild(itemLi);
                });
                breakdownDiv.appendChild(itemsUl);
            }

            breakdownDiv.innerHTML += `
                <div class="summary-line subtotal">
                    <span class="label">Subtotal Item:</span>
                    <span class="amount">Rp ${person.subtotalItems.toLocaleString('id-ID')}</span>
                </div>
                <div class="summary-line">
                    <span class="label">Pajak & Layanan (Bagian Anda):</span>
                    <span class="amount positive">+ Rp ${person.shareOfAdditionalCosts.toLocaleString('id-ID')}</span>
                </div>
                <div class="summary-line">
                    <span class="label">Diskon (Bagian Anda):</span>
                    <span class="amount negative">- Rp ${person.shareOfDiscount.toLocaleString('id-ID')}</span>
                </div>
            `;
            personDiv.appendChild(breakdownDiv);
            billSummaryDiv.appendChild(personDiv);
        });

        totalBillDisplayP.textContent = `Total Keseluruhan Tagihan (Setelah Pembulatan): Rp ${grandTotal.toLocaleString('id-ID')}`;
        resultsSectionDiv.style.display = 'block';
        resultsSectionDiv.scrollIntoView({ behavior: 'smooth' });
    }

    function copyResults() {
        const billName = sanitizeHTML(billNameInput.value.trim()) || "Tagihan Tanpa Nama";
        let textToCopy = `RINCIAN TAGIHAN: ${billName}\n`;
        textToCopy += "=====================================\n\n";

        const personSummaries = billSummaryDiv.querySelectorAll('.person-payment-summary');
        personSummaries.forEach(summary => {
            const name = summary.querySelector('.person-header h3').textContent;
            const finalTotal = summary.querySelector('.person-header .person-total-final').textContent;
            textToCopy += `${name.toUpperCase()} - ${finalTotal}\n`;

            const itemsList = summary.querySelectorAll('.item-contribution-list li');
            if (itemsList.length > 0) {
                textToCopy += "  Kontribusi Item:\n";
                itemsList.forEach(itemLi => {
                    const itemNamePrice = itemLi.querySelector('.item-name-price').textContent.trim();
                    
                    const itemShareElement = itemLi.querySelector('.item-share');
                    let itemShareText = "";
                    if (itemShareElement) {
                        itemShareText = itemShareElement.textContent
                                          .replace(/↳/g, "")      
                                          .replace(/\s+/g, " ")  
                                          .trim();
                    }
                    textToCopy += `    - ${itemNamePrice}\n      ↳ ${itemShareText}\n`;
                });
            }

            const subtotalLine = summary.querySelector('.summary-line.subtotal .amount').textContent;
            const additionalCostLine = summary.querySelector('.summary-line .amount.positive').textContent;
            const discountLine = summary.querySelector('.summary-line .amount.negative').textContent;

            textToCopy += `  Subtotal Item: ${subtotalLine}\n`;
            textToCopy += `  Pajak & Layanan: ${additionalCostLine}\n`;
            textToCopy += `  Diskon: ${discountLine}\n`;
            textToCopy += "-------------------------------------\n\n";
        });

        textToCopy += `\n${totalBillDisplayP.textContent}\n\n`;
        textToCopy += `Dibagi menggunakan Split Ease by Wadi!`;

        navigator.clipboard.writeText(textToCopy)
            .then(() => alert('Rincian berhasil disalin ke clipboard!'))
            .catch(err => {
                console.error('Gagal menyalin: ', err);
                alert('Gagal menyalin rincian. Coba lagi atau salin manual.');
            });
    }

    function startNew() {
        if (confirm('Apakah Anda yakin ingin memulai baru? Semua data akan dihapus.')) {
            people = []; items = [];
            billNameInput.value = ''; personNameInput.value = ''; itemNameInput.value = ''; itemPriceInput.value = '';
            
            taxPercentageInput.value = '0'; 
            serviceFeeInput.value = '0'; 
            discountAmountInput.value = '0';
            additionalCostDistributionSelect.value = 'evenly';
            if (additionalCostsFieldsDiv && toggleAdditionalCostsBtn && toggleIcon) {
                additionalCostsFieldsDiv.style.display = 'none';
                toggleAdditionalCostsBtn.setAttribute('aria-expanded', 'false');
                toggleIcon.textContent = '+';
            }

            renderPeopleList(); renderItemPayersList(); renderItemsList();
            resultsSectionDiv.style.display = 'none'; billSummaryDiv.innerHTML = '';
            totalBillDisplayP.textContent = 'Total Keseluruhan Tagihan: Rp 0';
            const selectAllPayersCheckbox = document.getElementById('select-all-payers');
            if (selectAllPayersCheckbox) selectAllPayersCheckbox.checked = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function saveResultsAsImage() {
        const elementToCapture = document.getElementById('results-section');
        if (!elementToCapture || typeof html2canvas === 'undefined') {
            alert('Fitur simpan gambar tidak tersedia atau gagal memuat library html2canvas.');
            return;
        }

        const originalButtonText = saveImageBtn.innerHTML;
        saveImageBtn.innerHTML = 'Memproses...';
        saveImageBtn.disabled = true;

        const options = {
            scale: window.devicePixelRatio * 1.5, 
            useCORS: true, 
            backgroundColor: '#eaf5ff', // Match results section background
            scrollX: 0, // Ensure capture starts from the top-left
            scrollY: 0,
             onclone: (document) => {
                // If the collapsible section for additional costs is hidden but has values,
                // we might want to show it for the image capture.
                // However, for simplicity, we'll capture what's currently shown.
                // If you want to ensure it's always shown in the image if values exist:
                // const additionalCostsDiv = document.getElementById('additional-costs-fields');
                // if (additionalCostsDiv && (parseFloat(taxPercentageInput.value) > 0 || parseFloat(serviceFeeInput.value) > 0 || parseFloat(discountAmountInput.value) > 0)) {
                //     additionalCostsDiv.style.display = 'block';
                // }
            }
        };

        html2canvas(elementToCapture, options).then(canvas => {
            const imageURL = canvas.toDataURL('image/png');
            const billNameText = sanitizeHTML(billNameInput.value.trim()) || "rincian_pembayaran";
            const filename = `${billNameText.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_splitease_by_wadi.png`;

            const link = document.createElement('a');
            link.href = imageURL;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            saveImageBtn.innerHTML = originalButtonText;
            saveImageBtn.disabled = false;
        }).catch(err => {
            console.error('Gagal menyimpan gambar:', err);
            alert('Terjadi kesalahan saat mencoba menyimpan gambar.');
            saveImageBtn.innerHTML = originalButtonText;
            saveImageBtn.disabled = false;
        });
    }


    // --- Event Listeners ---
    addPersonBtn.addEventListener('click', addPerson);
    personNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPerson(); });
    addItemBtn.addEventListener('click', addItem);
    calculateBillBtn.addEventListener('click', calculateBill);
    copyResultsBtn.addEventListener('click', copyResults);
    startNewBtn.addEventListener('click', startNew);
    printBtn.addEventListener('click', () => {
        window.print();
    });
    saveImageBtn.addEventListener('click', saveResultsAsImage);
});
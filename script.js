document.addEventListener('DOMContentLoaded', function () {
    const criteriaRadios = document.querySelectorAll('input[type="radio"]');
    const totalMarkInput = document.getElementById('total-mark');
    const groupSelect = document.getElementById('group');
    const groupPoster = document.getElementById('group-poster');
    const leftPanel = document.querySelector('.left-panel');
    const form = document.querySelector('form');

    criteriaRadios.forEach(radio => {
        radio.addEventListener('change', updateTotalMark);
    });

    groupSelect.addEventListener('change', updateGroupPoster);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        sendDataToGoogleSheets();
    });

    function updateTotalMark() {
        let totalMark = 0;
        for (let i = 1; i <= 6; i++) {
            const selectedRadio = document.querySelector(`input[name="criteria${i}"]:checked`);
            if (selectedRadio) {
                totalMark += parseInt(selectedRadio.value);
            }
        }
        totalMarkInput.value = totalMark;
    }

    function updateGroupPoster() {
        const selectedGroup = groupSelect.value;
        if (selectedGroup) {
            const imagePath = `${selectedGroup}`;
            const imageExtensions = ['jpg', 'png'];
            const pdfExtension = 'pdf';
            let found = false;

            // Check for image files
            for (const ext of imageExtensions) {
                const img = new Image();
                img.src = `${imagePath}.${ext}`;
                img.onload = function() {
                    if (!found) {
                        found = true;
                        groupPoster.src = this.src;
                        groupPoster.style.display = 'block';
                        if (groupPoster.tagName.toLowerCase() !== 'img') {
                            groupPoster.outerHTML = `<img id="group-poster" src="${this.src}" alt="Poster for ${selectedGroup}">`;
                        }
                    }
                };
            }

            // Check for PDF file
            const pdfUrl = `${imagePath}.${pdfExtension}`;
            fetch(pdfUrl)
                .then(response => {
                    if (response.ok && !found) {
                        found = true;
                        groupPoster.style.display = 'none';
                        if (groupPoster.tagName.toLowerCase() !== 'iframe') {
                            groupPoster.outerHTML = `<iframe id="group-poster" src="${pdfUrl}" width="100%" height="100%" frameborder="0"></iframe>`;
                        } else {
                            groupPoster.src = pdfUrl;
                        }
                    }
                })
                .catch(() => {
                    if (!found) {
                        groupPoster.src = 'default.jpg';
                        groupPoster.style.display = 'block';
                        if (groupPoster.tagName.toLowerCase() !== 'img') {
                            groupPoster.outerHTML = `<img id="group-poster" src="default.jpg" alt="Default Poster">`;
                        }
                    }
                });
        } else {
            groupPoster.src = 'default.jpg';
            groupPoster.style.display = 'block';
            if (groupPoster.tagName.toLowerCase() !== 'img') {
                groupPoster.outerHTML = `<img id="group-poster" src="default.jpg" alt="Default Poster">`;
            }
        }
    }

    function sendDataToGoogleSheets() {
        const juryName = document.getElementById('jury-name').value;
        const groupName = document.getElementById('group').value;
        const criteria = [];
        for (let i = 1; i <= 6; i++) {
            const selectedRadio = document.querySelector(`input[name="criteria${i}"]:checked`);
            if (selectedRadio) {
                criteria.push(parseInt(selectedRadio.value));
            } else {
                criteria.push(0);
            }
        }
        const totalMark = document.getElementById('total-mark').value;

        const data = {
            juryName,
            groupName,
            criteria,
            totalMark
        };

        fetch('https://script.google.com/macros/s/AKfycbxkhUFWs92wt3hvmJoq5Rm4bLE1C99VgKp7HKrJ4L89JHpwNgh18DpmOktG9POvGHit8g/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                alert('Data saved successfully!');
            } else {
                alert('Failed to save data.');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
});
ss
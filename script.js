document.addEventListener('DOMContentLoaded', function () {
    const criteriaRadios = document.querySelectorAll('input[type="radio"]');
    const totalMarkInput = document.getElementById('total-mark');
    const groupSelect = document.getElementById('group');
    let groupPoster = document.getElementById('group-poster');
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
        for (let i = 1; i <= 12; i++) {
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
            const imagePath = `gambar/${selectedGroup}`;
            const imageExtensions = ['jpg', 'png'];
            const pdfExtension = 'pdf';
            let found = false;

            // Reset groupPoster to its default state before loading new content
            groupPoster.src = '';
            groupPoster.style.display = 'none';

            // Function to handle image load success
            const handleImageLoad = function (src) {
                if (!found) {
                    found = true;
                    groupPoster.src = src;
                    groupPoster.style.display = 'block';
                    if (groupPoster.tagName.toLowerCase() !== 'img') {
                        groupPoster.outerHTML = `<img id="group-poster" src="${src}" alt="Poster for ${selectedGroup}">`;
                        groupPoster = document.getElementById('group-poster');
                    }
                }
            };

            // Check for image files
            for (const ext of imageExtensions) {
                const img = new Image();
                img.src = `${imagePath}.${ext}?${new Date().getTime()}`; // Cache busting
                img.onload = function () {
                    handleImageLoad(this.src);
                };
            }

            // Check for PDF file
            const pdfUrl = `${imagePath}.${pdfExtension}?${new Date().getTime()}`; // Cache busting
            fetch(pdfUrl)
                .then(response => {
                    if (response.ok && !found) {
                        found = true;
                        groupPoster.style.display = 'none';
                        if (groupPoster.tagName.toLowerCase() !== 'iframe') {
                            groupPoster.outerHTML = `<iframe id="group-poster" src="${pdfUrl}" width="100%" height="100%" frameborder="0"></iframe>`;
                            groupPoster = document.getElementById('group-poster');
                        } else {
                            groupPoster.src = pdfUrl;
                        }
                    }
                })
                .catch(() => {
                    if (!found) {
                        groupPoster.src = 'gambar/default.jpg';
                        groupPoster.style.display = 'block';
                        if (groupPoster.tagName.toLowerCase() !== 'img') {
                            groupPoster.outerHTML = `<img id="group-poster" src="gambar/default.jpg" alt="Default Poster">`;
                            groupPoster = document.getElementById('group-poster');
                        }
                    }
                });
        } else {
            groupPoster.src = 'gambar/default.jpg';
            groupPoster.style.display = 'block';
            if (groupPoster.tagName.toLowerCase() !== 'img') {
                groupPoster.outerHTML = `<img id="group-poster" src="gambar/default.jpg" alt="Default Poster">`;
                groupPoster = document.getElementById('group-poster');
            }
        }
    }

    function sendDataToGoogleSheets() {
        const juryName = document.getElementById('jury-name').value;
        const groupName = document.getElementById('group').value;
        const criteria = [];
        for (let i = 1; i <= 12; i++) {
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
                alert('Data saved successfully!');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
});

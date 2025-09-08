
        // Simple JavaScript for interactive elements
        document.addEventListener('DOMContentLoaded', function() {
            // Add question button functionality
            const addQuestionBtn = document.querySelector('.add-question-btn');
            addQuestionBtn.addEventListener('click', function() {
                alert('Add Question feature would open a modal or form here!');
            });

            // Logout button functionality
            const logoutBtn = document.querySelector('.logout-btn');
            logoutBtn.addEventListener('click', function() {
                if(confirm('Are you sure you want to log out?')) {
                    alert('User logged out successfully!');
                }
            });

            // Navigation links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        });

        

       
        
        document.getElementById('submitQuestionBtn').addEventListener('click', function() {
            const questionText = document.getElementById('questionText').value.trim();
            const answerInputs = Array.from(document.querySelectorAll('.answer-input'));
            const pointsInputs = Array.from(document.querySelectorAll('.points-input'));

            if (!questionText) {
                alert('Please enter a question.');
                return;
            }

            const answers = [];

            for (let i = 0; i < answerInputs.length; i++) {
                let answer = answerInputs[i].value.trim();
                let pointsRaw = pointsInputs[i].value.trim();

                // If answer is empty, replace with "-"
                if (!answer) {
                answer = "-";
                }

                // If points is empty, replace with 0
                if (!pointsRaw) {
                pointsRaw = "0";
                }

                // Validate points is a number
                const points = Number(pointsRaw);
                if (isNaN(points)) {
                alert(`Please enter a valid number for points in answer #${i + 1}.`);
                return;
                }

                answers.push({ answer, points });
            }

            // Validate answers count (1 to 6)
            if (answers.length < 1 || answers.length > 6) {
                alert('Please provide between 1 and 6 answers.');
                return;
            }

            const data = {
                question: questionText,
                answers: answers
            };

            fetch('/api/questions/create', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Failed to add question'); });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Question added successfully!');
                document.getElementById('addQuestionForm').reset();
                // If using Bootstrap 5 modal:
                const modalEl = document.getElementById('addQuestionModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add question. ' + error.message);
            });
        });

     async function loadQuestions() {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) throw new Error('Failed to fetch questions');
    const questions = await response.json();

    const container = document.getElementById('questionsContainer');
    container.innerHTML = ''; // Clear existing content

    questions.forEach((q, index) => {
      const div = document.createElement('div');
      div.className = 'question-container';
      div.dataset.index = index;
      div.dataset.id = q._id;

      div.innerHTML = `
        <div class="question-text" style="font-weight:bold; font-size:28px; margin-bottom:10px;">
          ${q.question}
        </div>
        <ul class="answers-list" style="font-size:16px; margin-left:20px; margin-bottom:10px;">
          ${q.answers.map(a => `<li>${a.answer} (${a.points} points)</li>`).join('')}
        </ul>
        <div class="buttons" style="display:flex; gap:10px;">
          <button class="edit-btn" data-id="${q._id}">Edit</button>
          <button class="up-btn" data-index="${index}" ${index === 0 ? 'disabled' : ''}>Up</button>
          <button class="down-btn" data-index="${index}" ${index === questions.length - 1 ? 'disabled' : ''}>Down</button>
        </div>
      `;

      container.appendChild(div);
    });

    // Attach event listeners after rendering
    attachButtonHandlers();

  } catch (error) {
    console.error(error);
    alert('Error loading questions: ' + error.message);
  }
}

function attachButtonHandlers() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      alert('Edit question with ID: ' + id);
      // TODO: Redirect or open modal for editing
    });
  });

  document.querySelectorAll('.up-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.getAttribute('data-index'));
      alert('Move question up at index: ' + index);
      // TODO: Implement reorder logic here
    });
  });

  document.querySelectorAll('.down-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.getAttribute('data-index'));
      alert('Move question down at index: ' + index);
      // TODO: Implement reorder logic here
    });
  });
}

// Load questions on page load
document.addEventListener('DOMContentLoaded', loadQuestions);


document.getElementById('startGameBtn').addEventListener('click', () => {
  // URLs for your game screen and controller pages
  // Adjust these URLs to your actual routes or files
  const gameScreenUrl = '/gamescreen';      // e.g. route serving the game screen
  const controllerUrl = '/controller';  // e.g. route serving the controller

  //open windows with game screen and controller with questions variable attached
  window.open(controllerUrl, 'Controller', 'width=800,height=600');
  window.open(gameScreenUrl, 'GameScreen', 'width=800,height=600');
  
  alert('Game started! Game screen and controller are now open.');

  // Optionally, you can redirect to a specific page or perform other actions
  // window.location.href = '/some-other-page';
  // Or you can close the current window if needed
  // window.close();
  // Note: Ensure that your server is set up to handle these routes correctly
  // and that the game screen and controller pages are designed to work with the questions data.
  // For example, you might want to pass the questions data to these pages
  // via a global variable, local storage, or by rendering them server-side.
  // This is a simple example; you can enhance it further based on your requirements.
  // For example, you might want to pass the questions data to these pages
  // via a global variable, local storage, or by rendering them server-side.



  
});

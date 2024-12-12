        function measurePing() {
      var xhr = new XMLHttpRequest();
      var startTime, endTime;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          endTime = Date.now();
          var pingTime = endTime - startTime;
          var pingElement = document.querySelector('#ping .ping-text');
          pingElement.textContent = pingTime + " ms";

          var pingContainer = document.querySelector('.ping-container');
          if (pingTime <= 299) {
            pingContainer.classList.remove('ping-medium', 'ping-bad');
            pingContainer.classList.add('ping-good');
          } else if (pingTime <= 599) {
            pingContainer.classList.remove('ping-good', 'ping-bad');
            pingContainer.classList.add('ping-medium');
          } else {
            pingContainer.classList.remove('ping-good', 'ping-medium');
            pingContainer.classList.add('ping-bad');
          }
        }
      };
      xhr.open("GET", location.href + "?t=" + new Date().getTime());
      startTime = Date.now();
      xhr.send();
    }
    setInterval(measurePing, 1000);

    function updatePing() {
    const start = performance.now();
    const pingText = document.querySelector('#ping');

    fetch('/')
      .then(() => {
        const end = performance.now();
        const time = end - start;
        pingText.textContent = `Ping: ${time.toFixed(2)} ms`;
      })
      .catch((error) => console.error(error));
  }

  setInterval(updatePing, 1000);
  updatePing();

document.addEventListener("DOMContentLoaded", function() {
  var audio = document.getElementById("audio");
  var playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
    }).catch(error => {
      window.addEventListener("click", function() {
        audio.play();
      });
    });
  }
});

document.getElementById('json-data').addEventListener('input', function() {
    this.style.height = 'none';
    this.style.height = 'px';
});
/*
document.getElementById("showCommandsBtn").addEventListener("click", function() {
    const commandsDiv = document.getElementById("availableCommands");
    const commandsList = document.getElementById('commandsList');

    if (commandsDiv.classList.contains("show-commands")) {
        commandsList.style.display = 'none'; // Hide the commands list
    } else {
        fetchCommands(); // Add your fetchCommands function call here if needed
        commandsList.style.display = 'block'; // Display the commands list
    }

    commandsDiv.classList.toggle("show-commands");
    this.classList.toggle("show-button");
});*/


function fetchCommands() {
    axios.get('/commands')
        .then(response => {
            const data = response.data;
            if (data && Array.isArray(data.commands)) {
                const commandsList = document.getElementById('commandsList');
                commandsList.innerHTML = '';

                // Display commands
                const commandsTitle = document.createElement('h3');
                commandsTitle.textContent = 'COMMANDS';
                commandsList.appendChild(commandsTitle);
                data.commands.forEach((command, index) => {
                    const commandItem = document.createElement('div');
                    commandItem.textContent = `${index + 1}. ${command}`;
                    commandsList.appendChild(commandItem);
                });

                // Display handle events
                if (data.handleEvents && Array.isArray(data.handleEvents)) {
                    const handleEventsTitle = document.createElement('h3');
                    handleEventsTitle.textContent = 'HANDLE EVENTS';
                    commandsList.appendChild(handleEventsTitle);
                    data.handleEvents.forEach((event, index) => {
                        const eventItem = document.createElement('div');
                        eventItem.textContent = `${index + 1}. ${event}`;
                        commandsList.appendChild(eventItem);
                    });
                }

             /*   // Display aliases
                if (data.aliases && Array.isArray(data.aliases)) {
                    const aliasesTitle = document.createElement('h3');
                    aliasesTitle.textContent = 'ALIASES';
                    commandsList.appendChild(aliasesTitle);
                    data.aliases.forEach((alias, index) => {
                        if (Array.isArray(alias)) {
                            const aliasItem = document.createElement('div');
                            aliasItem.textContent = `${index + 1}. ${alias.join(', ')}`;
                            commandsList.appendChild(aliasItem);
                        }
                    });
                }*/

                // Display the command list
                commandsList.style.display = 'block';
            } else {
                console.error('Invalid response format from server.');
            }
        })
        .catch(error => {
            console.error('Error fetching commands:', error);
        });
}

/*
document.getElementById('agreeCheckbox').addEventListener('change', function() {
    const submitButton = document.getElementById('submitButton');
    submitButton.style.display = this.checked ? 'block' : 'none';
});*/

document.getElementById('submitButton').addEventListener('click', function(event) {
  event.preventDefault();
  State(); 
});

document.getElementById('cookie-form').addEventListener('submit', function(event) {
  event.preventDefault();
  State();
});


/*function showAds() {
    var ads = [
        'https://tinyurl.com/24jn3sxr',
        'https://tinyurl.com/27ftp24m',
        'https://tinyurl.com/22axs8qu',
        'https://tinyurl.com/2y4bujzl',
        'https://tinyurl.com/29qyrnwz',
        'https://direct-link.net/1146400/rootless-module'
    ];
    var index = Math.floor(Math.random() * ads.length);
    window.location.href = ads[index];
}
*/

function State() {
    const jsonInput = document.getElementById('json-data');
    const button = document.getElementById('submitButton');
    try {
        button.style.display = 'none';
        const State = JSON.parse(jsonInput.value);
        if (State && typeof State === 'object') {
            axios.post('/login', {
                    state: State,
                    prefix: document.getElementById('inputOfPrefix').value,
                    admin: document.getElementById('inputOfAdmin').value,
                })
                .then(response => {
                    const data = response.data;
                    if (data.success) {
                        jsonInput.value = '';
                        showResult(data.message);
                        //showAds();
                    } else {
                        jsonInput.value = '';
                        showResult(`Facebook may temporarily lock your account or restrict it if it suspects any suspicious activity or a potential security breach, to protect you. If Facebook suspects that your account is being logged in as a bot or, being flag as a spam, it may take longer you should try submit appstate later!`);
                        //showAds();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showResult('An error occurred. Please try again later.');
                   // showAds();
                })
                .finally(() => {
                    setTimeout(() => {
                        button.style.display = 'block';
                    }, 4000);
                });
        } else {
            jsonInput.value = '';
            showResult('Invalid JSON data. Please check your input.');
           // showAds();
        }
    } catch (parseError) {
        jsonInput.value = '';
        console.error('Error parsing JSON:', parseError);
        showResult('Error parsing JSON. Please check your input.');
        //showAds();
    }
}

function showResult(message) {
  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = `<h5>${message}</h5>`;
  resultContainer.style.display = 'block';
}
     async function getState() {
      const email = document.getElementById("email").value;
      const pass = document.getElementById("password").value;

      if (!email || !pass) {
        alert("Please enter both email and password.");
      } else {
        try {
          const response = await fetch(`/stater?email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`);

          if (response.ok) {
            const data = await response.json();

            if (data.appState) {
              document.getElementById("json-data").value = data.appState;
              alert("Appstate retrieved successfully.");
            } else {
              alert("Login failed or no state received.");
            }
          } else {
            alert("Error: " + response.statusText);
          }
        } catch (error) {
          alert("Internal server error");
        }
      }
    }

    function fetchOnlineUsersCount() {
    axios.get('/online-users')
        .then(response => {
            document.getElementById('onlineUsers').textContent = response.data.onlineUsers;
        })
        .catch(error => {
            console.error('Error fetching online users count:', error);
        });
}

// Fetch online users count when the page loads
window.onload = function() {
    fetchOnlineUsersCount();
};

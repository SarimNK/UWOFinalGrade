// UWOFinalGrade - content.js
// By: Asim Aleem

(function() {
    console.log("UWO Grade Calc: Script injected.");

    // --- CSS Injection ---
    const style = document.createElement('style');
    style.textContent = `
        #grade-calculator-overlay {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            background: white;
            border: 2px solid #003366;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }

        #calculator-header {
            background: #003366;
            color: white;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px 6px 0 0;
            font-weight: bold;
        }

        #toggle-button {
            background: none;
            border: 1px solid white;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
        }

        #toggle-button:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        #calculator-content {
            padding: 15px;
            max-height: 500px;
            overflow-y: auto;
        }

        #grades-container h3, #summary-container h3 {
            margin: 0 0 10px 0;
            color: #003366;
            font-size: 16px;
        }

        #grades-container ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }

        #grades-container li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            font-size: 13px;
        }

        #grades-container li:last-child {
            border-bottom: none;
        }

        #summary-container {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #003366;
        }

        #summary-container p {
            margin: 5px 0;
        }

        #summary-container strong {
            color: #003366;
        }

        .grade-calculator-overlay.minimized #calculator-content {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // --- UI Creation ---
    const overlay = document.createElement('div');
    overlay.id = 'grade-calculator-overlay';
    overlay.innerHTML = `
        <div id="calculator-header">
            <span>UWO Grade Calculator</span>
            <button id="toggle-button">-</button>
        </div>
        <div id="calculator-content">
            <div id="grades-container">Searching for grades...</div>
            <div id="summary-container"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    console.log("UWO Grade Calc: UI overlay created and added to page.");

    // Test if UI is visible
    setTimeout(() => {
        const testOverlay = document.getElementById('grade-calculator-overlay');
        if (testOverlay) {
            const rect = testOverlay.getBoundingClientRect();
            console.log("UWO Grade Calc: UI position:", rect);
            console.log("UWO Grade Calc: UI computed style:", window.getComputedStyle(testOverlay).display);
        } else {
            console.log("UWO Grade Calc: ERROR - UI overlay not found in DOM!");
        }
    }, 1000);

    const content = document.getElementById('calculator-content');
    const toggleButton = document.getElementById('toggle-button');

    toggleButton.addEventListener('click', () => {
        const isMinimized = content.style.display === 'none';
        content.style.display = isMinimized ? 'block' : 'none';
        toggleButton.textContent = isMinimized ? '-' : '+';
        overlay.classList.toggle('minimized', !isMinimized);
    });

    // --- Core Logic ---
    const gradesContainer = document.getElementById('grades-container');
    const summaryContainer = document.getElementById('summary-container');
    let searchInterval;
    let timeout;
    let isParsing = false;
    let hasSuccessfullyParsed = false;

    function parseGrades(table) {
        console.log("UWO Grade Calc: Grade table found, parsing...");
        const rows = table.querySelectorAll('tr');
        let grades = [];
        
        console.log("UWO Grade Calc: Found", rows.length, "rows to process");

        rows.forEach((row, index) => {
            // Skip header rows
            if (row.classList.contains('d_gh') || row.querySelector('th[colspan]')) {
                console.log(`UWO Grade Calc: Skipping header row ${index}`);
                return;
            }

            const labelElement = row.querySelector('th label');
            if (!labelElement) {
                console.log(`UWO Grade Calc: No label found in row ${index}`);
                return;
            }

            const name = labelElement.textContent.trim();
            console.log(`UWO Grade Calc: Processing "${name}"`);

            // Skip "Final Calculated Grade" and other non-grade items
            if (name.toLowerCase().includes('final calculated grade') || 
                name.toLowerCase().includes('final grade override') ||
                name.toLowerCase().includes('student number')) {
                console.log(`UWO Grade Calc: Skipping non-grade item: ${name}`);
                return;
            }

            // Handle both flat and hierarchical structures
            let pointsCell, weightCell;
            const allCells = row.querySelectorAll('td');
            
            if (row.querySelector('.d_g_treeNodeImage')) {
                // Hierarchical structure: spacer + label + points + weight + grade + comments
                // Skip the tree spacer, start from first data cell
                pointsCell = allCells[1]; // Second td (first data cell after spacer)
                weightCell = allCells[2]; // Third td (second data cell)
            } else {
                // Flat structure: label + points + weight + grade + comments
                pointsCell = allCells[0]; // First td
                weightCell = allCells[1]; // Second td
            }

            if (!pointsCell || !weightCell) {
                console.log(`UWO Grade Calc: Missing cells for "${name}"`);
                return;
            }
            
            // Get points and weight from the cells
            const pointsText = pointsCell.textContent.trim();
            const weightText = weightCell.textContent.trim();

            console.log(`UWO Grade Calc: Points: "${pointsText}", Weight: "${weightText}"`);

            // Parse points (format: "107 / 110")
            const pointsMatch = pointsText.match(/([\d\.]+) \/ ([\d\.]+)/);
            // Parse weight (format: "9.73 / 10")
            const weightMatch = weightText.match(/([\d\.]+) \/ ([\d\.]+)/);

            if (pointsMatch && weightMatch) {
                const numerator = parseFloat(pointsMatch[1]);
                const denominator = parseFloat(pointsMatch[2]);
                const weightAchieved = parseFloat(weightMatch[1]);
                const weightTotal = parseFloat(weightMatch[2]);
                
                if (!isNaN(numerator) && !isNaN(denominator) && !isNaN(weightAchieved) && !isNaN(weightTotal) && weightTotal > 0) {
                     console.log(`UWO Grade Calc: Added grade: ${name} - ${numerator}/${denominator} - ${weightAchieved}/${weightTotal}`);
                     grades.push({ 
                         name, 
                         numerator, 
                         denominator, 
                         weightAchieved,
                         weightTotal 
                     });
                }
            } else {
                console.log(`UWO Grade Calc: Failed to parse points or weight for "${name}"`);
            }
        });

        console.log(`UWO Grade Calc: Parsed ${grades.length} valid grades`);

        if (grades.length > 0) {
            displayGrades(grades);
            calculateAndDisplaySummary(grades);
            hasSuccessfullyParsed = true; // Mark as successfully parsed
        } else {
             gradesContainer.innerHTML = 'No valid grades found to calculate.';
        }
        
        // Reset parsing flag
        isParsing = false;
    }

    function displayGrades(grades) {
        gradesContainer.innerHTML = '<h3>Detected Grades:</h3>';
        const list = document.createElement('ul');
        grades.forEach(grade => {
            const listItem = document.createElement('li');
            const percentage = grade.denominator > 0 ? ((grade.numerator / grade.denominator) * 100).toFixed(2) : '0';
            listItem.textContent = `${grade.name}: ${grade.numerator}/${grade.denominator} (${percentage}%) - Weight: ${grade.weightAchieved.toFixed(2)}/${grade.weightTotal.toFixed(2)}%`;
            list.appendChild(listItem);
        });
        gradesContainer.appendChild(list);
    }

    function calculateAndDisplaySummary(grades) {
        let totalWeightAchieved = 0;
        let totalWeightPossible = 0;

        grades.forEach(grade => {
            // Add the weight achieved for this assignment
            totalWeightAchieved += grade.weightAchieved;
            // Add the total possible weight for this assignment category
            totalWeightPossible += grade.weightTotal;
        });

        const currentPercentage = totalWeightPossible > 0 ? (totalWeightAchieved / totalWeightPossible) * 100 : 0;

        summaryContainer.innerHTML = `
            <h3>Summary</h3>
            <p>Total Weighted Score: ${totalWeightAchieved.toFixed(2)} / ${totalWeightPossible.toFixed(2)}%</p>
            <p><strong>Current Course Percentage: ${currentPercentage.toFixed(2)}%</strong></p>
            <p><em>Weight accounted for: ${totalWeightPossible.toFixed(2)}% of course</em></p>
        `;
    }

    function findGrades() {
        if (isParsing) {
            console.log("UWO Grade Calc: Already parsing, skipping...");
            return;
        }
        
        console.log("UWO Grade Calc: Searching for grades table...");
        
        // Try multiple selectors to find the grades table
        let table = document.querySelector('table#z_a.d2l-table.d2l-grid.d_gl');
        
        if (!table) {
            // Try alternative selectors
            table = document.querySelector('d2l-table[title="Grades"]');
            console.log("UWO Grade Calc: Trying d2l-table selector:", table ? "Found!" : "Not found");
        }
        
        if (!table) {
            table = document.querySelector('table.d2l-table');
            console.log("UWO Grade Calc: Trying generic d2l-table selector:", table ? "Found!" : "Not found");
        }
        
        if (!table) {
            // Log all tables on the page for debugging
            const allTables = document.querySelectorAll('table');
            console.log("UWO Grade Calc: Found", allTables.length, "tables on page");
            allTables.forEach((t, i) => {
                console.log(`Table ${i}:`, t.className, t.id, t.getAttribute('title'));
            });
        }
        
        if (table) {
            console.log("UWO Grade Calc: Found grades table!", table);
            isParsing = true;
            clearInterval(searchInterval);
            clearTimeout(timeout);
            parseGrades(table);
        }
    }

    function startSearch() {
        searchInterval = setInterval(findGrades, 500); // Check every 500ms
        timeout = setTimeout(() => {
            clearInterval(searchInterval);
            if (!document.querySelector('#grades-container ul')) {
                 console.log("UWO Grade Calc: Timed out waiting for grades table.");
                 gradesContainer.innerHTML = 'Could not find grades table. Please ensure you are on the main "Grades" page for a course.';
            }
        }, 20000); // 20 second timeout
    }

    // --- Entry Point ---
    function init() {
        if (hasSuccessfullyParsed) {
            console.log("UWO Grade Calc: Already successfully parsed grades, skipping initialization.");
            return;
        }
        
        console.log("UWO Grade Calc: Initializing...");
        console.log("UWO Grade Calc: Current URL:", window.location.href);
        console.log("UWO Grade Calc: Page title:", document.title);
        
        // Check if we're on a Brightspace grades page
        const isGradesPage = window.location.href.includes('grades') || 
                           document.title.toLowerCase().includes('grades') ||
                           document.querySelector('[data-location="/grades/"]') ||
                           document.querySelector('d2l-navigation-link[href*="grades"]');
        
        console.log("UWO Grade Calc: Is grades page?", isGradesPage);
        
        if (isGradesPage || window.location.href.includes('brightspace.com')) {
            startSearch();
        } else {
            gradesContainer.innerHTML = 'This extension only works on Brightspace grades pages.';
        }
    }

    // Try multiple initialization points since D2L loads content dynamically
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also try after window load as a fallback
    window.addEventListener('load', () => {
         console.log("UWO Grade Calc: Window loaded, trying init again.");
         if (!hasSuccessfullyParsed && !isParsing) {
             init();
         }
    });

})();

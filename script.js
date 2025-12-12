// Sample data to work with
const CourseInfo = {
  id: 451,
  name: "Introduction to JavaScript"
};

const AssignmentGroup = {
  id: 12345,
  name: "Fundamentals of JavaScript",
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: "Declare a Variable",
      due_at: "2021-09-Caturday",
      points_possible: 50
    },
    {
      id: 2,
      name: "Write a Function",
      due_at: "2022-09-Caturday",
      points_possible: 150
    },
    {
      id: 3,
      name: "Code the World",
      due_at: "2025-09-Caturday", /
      points_possible: 500
    }
  ]
};

const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: "2021-01-04",
      score: 47
    }
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: "2022-01-02",
      score: 150
    }
  },
  {
    learner_id: 125,
    assignment_id: 3,
    submission: {
      submitted_at: "2023-01-04",
      score: 400
    }
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: "22024-01-04",
      score: 39
    }
  },
  {
    learner_id: 132,
    assignment_id: 2,
    submission: {
      submitted_at: "2025-01-04", // Late submission
      score: 140
    }
  }
];

/**
 * Main function to process learner data
 * @param {Object} course - CourseInfo object
 * @param {Object} ag - AssignmentGroup object
 * @param {Array} submissions - Array of LearnerSubmission objects
 * @returns {Array} - Array of processed learner results
 */
function getLearnerData(course, ag, submissions) {
  try {
    // Validate that the assignment group belongs to the course
    if (ag.course_id !== course.id) {
      throw new Error("Assignment group does not belong to the course!");
    }

    // Get current date to check if assignments are due
    const currentDate = new Date();

    // Object to store learner data temporarily
    const learnerMap = {};

    // Loop through each submission
    for (const submission of submissions) {
      try {
        // Find the assignment details for this submission
        const assignment = ag.assignments.find(
          a => a.id === submission.assignment_id
        );

        // Skip if assignment not found
        if (!assignment) {
          console.warn(`Assignment ${submission.assignment_id} not found`);
          continue;
        }

        // Check if points_possible is valid (not zero or negative)
        if (assignment.points_possible <= 0) {
          console.warn(`Invalid points_possible for assignment ${assignment.id}`);
          continue;
        }

        // Convert due date string to Date object
        const dueDate = new Date(assignment.due_at);

        // Skip assignments that are not yet due
        if (dueDate > currentDate) {
          continue;
        }

        // Get learner ID
        const learnerId = submission.learner_id;

        // Initialize learner object if it doesn't exist
        if (!learnerMap[learnerId]) {
          learnerMap[learnerId] = {
            id: learnerId,
            totalScore: 0,
            totalPossible: 0,
            assignments: {}
          };
        }

        // Get the score from submission
        let score = submission.submission.score;

        // Validate that score is a number
        if (typeof score !== 'number') {
          score = Number(score);
          if (isNaN(score)) {
            console.warn(`Invalid score for learner ${learnerId}`);
            continue;
          }
        }

        // Check if submission was late
        const submittedDate = new Date(submission.submission.submitted_at);
        if (submittedDate > dueDate) {
          // Deduct 10% of total points for late submission
          score -= assignment.points_possible * 0.1;
        }

        // Calculate percentage for this assignment
        const percentage = score / assignment.points_possible;

        // Add to learner's data
        learnerMap[learnerId].totalScore += score;
        learnerMap[learnerId].totalPossible += assignment.points_possible;
        learnerMap[learnerId].assignments[assignment.id] = percentage;

      } catch (error) {
        // Handle errors for individual submissions
        console.error(`Error processing submission: ${error.message}`);
      }
    }

    // Convert learnerMap to array format
    const result = [];
    for (const learnerId in learnerMap) {
      const learner = learnerMap[learnerId];

      // Calculate weighted average
      const avg = learner.totalPossible > 0 
        ? learner.totalScore / learner.totalPossible 
        : 0;

      // Create result object
      const learnerResult = {
        id: learner.id,
        avg: avg,
        ...learner.assignments // Spread assignment scores
      };

      result.push(learnerResult);
    }

    return result;

  } catch (error) {
    // Handle major errors
    console.error(`Error in getLearnerData: ${error.message}`);
    throw error;
  }
}

// Run the function and display results
try {
  const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
  console.log("Learner Data Results:");
  console.log(result);
  
  // Display results on the page
  displayResults(result);
} catch (error) {
  console.error("Failed to process learner data:", error.message);
  document.getElementById('output').innerHTML = 
    `<p style="color: red;">Error: ${error.message}</p>`;
}

/**
 * Helper function to display results in HTML
 * @param {Array} data - Array of learner results
 */
function displayResults(data) {
  const outputDiv = document.getElementById('output');
  
  if (!data || data.length === 0) {
    outputDiv.innerHTML = '<p>No data to display</p>';
    return;
  }

  let html = '<h2>Results:</h2>';
  
  data.forEach(learner => {
    html += `<div class="learner-card">`;
    html += `<h3>Learner ID: ${learner.id}</h3>`;
    html += `<p><strong>Average:</strong> ${(learner.avg * 100).toFixed(2)}%</p>`;
    html += `<h4>Assignment Scores:</h4><ul>`;
    
    for (const key in learner) {
      if (key !== 'id' && key !== 'avg') {
        html += `<li>Assignment ${key}: ${(learner[key] * 100).toFixed(2)}%</li>`;
      }
    }
    
    html += `</ul></div>`;
  });
  
  outputDiv.innerHTML = html;
}

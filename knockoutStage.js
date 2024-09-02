const {
    simulateGroupStage,
    calculateGroupStandings,
    displayResults,
    displayStandings,
    rankTeams,
    displayRankedTeams,
    getTeamsForKnockoutStage,
    assignTeamsToPots,
    drawQuarterfinals,
    simulateKnockoutStage
} = require('./groupStage');
const groups = require('./groups.json');

// Simulacija grupne faze
const groupResults = simulateGroupStage(groups);
displayResults(groupResults);
const groupStandings = calculateGroupStandings(groupResults, groups);
displayStandings(groupStandings);
const rankedTeams = rankTeams(groupStandings);
displayRankedTeams(rankedTeams);
const teamsForKnockoutStage = getTeamsForKnockoutStage(rankedTeams);

console.log("\nTimovi za eliminacionu fazu:");
teamsForKnockoutStage.forEach(team => {
    console.log(`${team.team} (Rang: ${team.rank})`);
});



// Dodela timova u šešire
const pots = assignTeamsToPots(teamsForKnockoutStage);

// Prikaz šešira
console.log("\nŠeširi:");
for (const pot in pots) {
    console.log(`    Šešir ${pot}`);
    pots[pot].forEach(team => {
        console.log(`        ${team.team}`);
    });
}

// Žreb i simulacija eliminacione faze
const quarterfinals = drawQuarterfinals(pots);
simulateKnockoutStage(quarterfinals);
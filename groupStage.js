const groups = require('./groups.json');
const exibitions = require('./exibitions.json');

//Simulacija jedne utakmice
function simulateMatch(teamA, teamB) {
    const rankingDifference = Math.abs(teamA.FIBARanking - teamB.FIBARanking);
    const basePoints = 80;
    const pointsVariance = 20;

    const teamAAdvantage = teamA.FIBARanking < teamB.FIBARanking ? 1.2 : 0.8;
    const scoreA = Math.round(basePoints + Math.random() * pointsVariance * teamAAdvantage);
    const scoreB = Math.round(basePoints + Math.random() * pointsVariance * (2 - teamAAdvantage));

    return {
        scoreA,
        scoreB,
        winner: scoreA > scoreB ? teamA : teamB
    };
}

//Simulacija svih utakmica u grupnoj fazi
function simulateGroupStage(groups) {
    let results = {};

    for (const group in groups) {
        const teams = groups[group];
        results[group] = [];

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const match = simulateMatch(teams[i], teams[j]);
                const result = {
                    teamA: teams[i].Team,
                    teamB: teams[j].Team,
                    scoreA: match.scoreA,
                    scoreB: match.scoreB,
                    winner: match.winner.Team
                };
                results[group].push(result);
            }
        }
    }

    return results;
}

//Prikaz rezultata u grupama
function displayResults(results) {
    console.log("Rezultati grupne faze:");

    for (const group in results) {
        console.log(`\nGrupa ${group}:`);
        results[group].forEach(match => {
            console.log(`${match.teamA} - ${match.teamB} (${match.scoreA} : ${match.scoreB})`);
        });
    }
}

//Plasman u grupama
function calculateGroupStandings(results, groups) {
    let standings = {};

    for (const group in results) {
        standings[group] = {};

        results[group].forEach(match => {
            const teamA = match.teamA;
            const teamB = match.teamB;

            if (!standings[group][teamA]) {
                standings[group][teamA] = { wins: 0, losses: 0, points: 0, scored: 0, conceded: 0 };
            }
            if (!standings[group][teamB]) {
                standings[group][teamB] = { wins: 0, losses: 0, points: 0, scored: 0, conceded: 0 };
            }

            standings[group][teamA].scored += match.scoreA;
            standings[group][teamA].conceded += match.scoreB;
            standings[group][teamB].scored += match.scoreB;
            standings[group][teamB].conceded += match.scoreA;

            if (match.winner === teamA) {
                standings[group][teamA].wins++;
                standings[group][teamA].points += 2;
                standings[group][teamB].losses++;
                standings[group][teamB].points += 1;
            } else {
                standings[group][teamB].wins++;
                standings[group][teamB].points += 2;
                standings[group][teamA].losses++;
                standings[group][teamA].points += 1;
            }
        });

        standings[group] = Object.entries(standings[group]).sort((a, b) => {
            return b[1].points - a[1].points || (b[1].scored - b[1].conceded) - (a[1].scored - a[1].conceded);
        });
    }

    return standings;
}

//Prikaz plasmana po grupama
function displayStandings(standings) {
    console.log("\nKonačan plasman u grupama:");

    for (const group in standings) {
        console.log(`\nGrupa ${group}:`);
        standings[group].forEach(([team, stats], index) => {
            console.log(`${index + 1}. ${team} ${stats.wins} / ${stats.losses} / ${stats.points} / ${stats.scored} / ${stats.conceded} / ${stats.scored - stats.conceded}`);
        });
    }
}

//Rangiranje timova iz svih grupa
function rankTeams(standings) {
    let allTeams = [];

    for (const group in standings) {
        const teams = standings[group];
        allTeams.push(...teams.slice(0, 3).map(([team, stats]) => ({ team, stats })));
    }

    allTeams.sort((a, b) => {
        return b.stats.points - a.stats.points ||
               (b.stats.scored - b.stats.conceded) - (a.stats.scored - a.stats.conceded) ||
               b.stats.scored - a.stats.scored;
    });

    const rankedTeams = allTeams.map((team, index) => ({
        ...team,
        rank: index + 1
    }));

    return rankedTeams;
}

//Prikaz rangiranih timova
function displayRankedTeams(rankedTeams) {
    console.log("\nRangiranje timova:");

    rankedTeams.forEach(team => {
        console.log(`Rang ${team.rank}: ${team.team} (Bodovi: ${team.stats.points}, Koš razlika: ${team.stats.scored - team.stats.conceded}, Postignuti koševi: ${team.stats.scored})`);
    });
}

//Određivanje timova koji prolaze u eliminacionu fazu
function getTeamsForKnockoutStage(rankedTeams) {
    return rankedTeams.filter(team => team.rank <= 8);
}

//Dodeljivanje timova u šešire na osnovu rangiranja
function assignTeamsToPots(teams) {
    const pots = { D: [], E: [], F: [], G: [] };

    teams.sort((a, b) => a.rank - b.rank);

    pots.D.push(teams[0], teams[1]); // Timovi sa rangom 1 i 2
    pots.E.push(teams[2], teams[3]); // Timovi sa rangom 3 i 4
    pots.F.push(teams[4], teams[5]); // Timovi sa rangom 5 i 6
    pots.G.push(teams[6], teams[7]); // Timovi sa rangom 7 i 8

    return pots;
}

//Žreb za četvrtfinale
function drawQuarterfinals(pots) {
    let quarterfinals = [];

    //Kombinovanje timova iz šešira D i G
    let shuffledG = [...pots.G].sort(() => 0.5 - Math.random());
    let shuffledD = [...pots.D].sort(() => 0.5 - Math.random());

    //Provera da li timovi iz D i G nisu igrali međusobno u grupnoj fazi
    for (let i = 0; i < shuffledD.length; i++) {
        quarterfinals.push([shuffledD[i], shuffledG[i]]);
    }

    //Kombinovanje timova iz šešira E i F
    let shuffledF = [...pots.F].sort(() => 0.5 - Math.random());
    let shuffledE = [...pots.E].sort(() => 0.5 - Math.random());

    //Provera da li timovi iz E i F nisu igrali međusobno u grupnoj fazi
    for (let i = 0; i < shuffledE.length; i++) {
        quarterfinals.push([shuffledE[i], shuffledF[i]]);
    }

    return quarterfinals;
}

//Simulacija eliminacione faze
function simulateKnockoutStage(quarterfinals) {
    let semifinals = [];
    let finals = [];
    let thirdPlaceMatch;

    console.log("\nČetvrtfinale:");

    //Simulacija četvrtfinala
    quarterfinals.forEach(match => {
        const [teamA, teamB] = match;
        const result = simulateMatch(teamA, teamB);

        console.log(`${teamA.team} - ${teamB.team} (${result.scoreA}: ${result.scoreB})`);

        semifinals.push(result.winner);
    });

    console.log("\nPolufinale:");

    //Nasumično ukrštanje za polufinale
    let shuffledSemifinals = [...semifinals].sort(() => 0.5 - Math.random());
    while (shuffledSemifinals.length) {
        const teamA = shuffledSemifinals.pop();
        const teamB = shuffledSemifinals.pop();
        const result = simulateMatch(teamA, teamB);

        console.log(`${teamA.team} - ${teamB.team} (${result.scoreA}: ${result.scoreB})`);

        finals.push(result.winner);
        if (teamA !== result.winner) {
            thirdPlaceMatch = teamA;
        } else {
            thirdPlaceMatch = teamB;
        }
    }

    console.log("\nUtakmica za treće mesto:");
    const thirdPlaceMatchTeamA = thirdPlaceMatch;
    const thirdPlaceMatchTeamB = semifinals.find(team => team !== thirdPlaceMatch);
    const thirdPlaceResult = simulateMatch(thirdPlaceMatchTeamA, thirdPlaceMatchTeamB);
    console.log(`${thirdPlaceMatchTeamA.team} - ${thirdPlaceMatchTeamB.team} (${thirdPlaceResult.scoreA}: ${thirdPlaceResult.scoreB})`);
    
    console.log("\nFinale:");
    const finalMatchTeamA = finals[0];
    const finalMatchTeamB = finals[1];
    const finalResult = simulateMatch(finalMatchTeamA, finalMatchTeamB);
    console.log(`${finalMatchTeamA.team} - ${finalMatchTeamB.team} (${finalResult.scoreA}: ${finalResult.scoreB})`);

    console.log("\nMedalje:");
    console.log(`1. ${finalResult.winner.team}`);
    console.log(`2. ${finals.find(team => team !== finalResult.winner).team}`);
    console.log(`3. ${thirdPlaceResult.winner.team}`);
}

module.exports = {
    simulateGroupStage,
    calculateGroupStandings,
    displayResults,
    displayStandings,
    rankTeams,
    displayRankedTeams,
    getTeamsForKnockoutStage,
    assignTeamsToPots,
    simulateMatch,
    drawQuarterfinals,
    simulateKnockoutStage
};
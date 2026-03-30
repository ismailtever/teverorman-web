export const InsightGenerator = {
    generate(metrics: {
        accuracy: number;
        reactionTime: number;
        stabilityScore: number;
    }, identity: string): string {
        const i = identity.toLowerCase();

        let insight = "";

        // Base insight from metrics
        if (metrics.stabilityScore > 85 && metrics.reactionTime < 700) {
            insight = "Your stability improved under time pressure. ";
        } else if (metrics.reactionTime < 600 && metrics.accuracy > 90) {
            insight = "Short bursts increased your accuracy. ";
        } else if (metrics.accuracy > 95) {
            insight = "Today is optimized for clarity. ";
        } else if (metrics.stabilityScore > 80) {
            insight = "Consistent execution across domains today. ";
        } else {
            insight = "Solid baseline performance established. ";
        }

        // Identity linking
        if (i.includes('focus') || i.includes('odak')) {
            insight += "Strengthened focus stability.";
        } else if (i.includes('discipline') || i.includes('disiplin')) {
            insight += "Execution consistency improved.";
        } else if (i.includes('calm') || i.includes('sakin')) {
            insight += "Stable performance under pressure.";
        } else if (i.includes('structure') || i.includes('düzen')) {
            insight += "Routine structure is forming.";
        } else {
            insight += "Repetition quality is rising.";
        }

        return insight;
    }
};

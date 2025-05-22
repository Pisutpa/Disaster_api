
const RISK_LEVEL = {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
};
const DisasterType = {
    flood: 'flood',
    earthquake: 'earthquake',
    wildfire: 'wildfire'
};

const classifyFloodScore = (rainfall) => {
    if (rainfall >= 15.0) return RISK_LEVEL.HIGH;
    if (rainfall >= 7.0) return RISK_LEVEL.MEDIUM;
    return RISK_LEVEL.LOW;
};
const classifyEarthquakeScore = (magnitude) => {
    if (magnitude >= 6.0) return RISK_LEVEL.HIGH;
    if (magnitude >= 4.0) return RISK_LEVEL.MEDIUM;
    return RISK_LEVEL.LOW;
};

const classifyWildfireScore = (index) => {
    if (index >= 40) return RISK_LEVEL.HIGH;
    if (index >= 20) return RISK_LEVEL.MEDIUM;
    return RISK_LEVEL.LOW;
};

exports.classifyScore = (disasterType, score) => {
    switch (disasterType) {
        case DisasterType.flood:
            return classifyFloodScore(score);
        case DisasterType.earthquake:
            return classifyEarthquakeScore(score);
        case DisasterType.wildfire:
            return classifyWildfireScore(score);

        default:
            return RISK_LEVEL.LOW;
    }
};

exports.calculateRiskScore = (disasterType, data) => {
    switch (disasterType) {
        case DisasterType.flood:
            const rainfall = parseFloat(data.rainfall);
            if (!isNaN(rainfall)) {
                return rainfall;
            }
            return 0;
        case DisasterType.earthquake:
            const magnitude = parseFloat(data.magnitude);
            if (!isNaN(magnitude)) {
                return magnitude;
            }
            return 0;
        // case DisasterType.wildfire:
        //     if (typeof data.rainfall === 'number') {
        //         return data.rainfall;
        //     }
        // return 0;
        default:
            return 0;
    }
};
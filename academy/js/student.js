/* ==========================================
   VOCALY Akademi
   Student Manager v1.0
========================================== */

const Student = {

    storageKey: "vocalyStudent",

    defaultData() {

        return {

            id: "",

            ad: "",

            soyad: "",

            okulNo: "",

            sinif: "",

            sube: "",

            okul: "",

            xp: 0,

            level: 1,

            badges: [],

            completedGames: [],

            statistics: {

                totalGames: 0,

                totalCorrect: 0,

                totalWrong: 0,

                totalPlayTime: 0

            }

        };

    },

    save(student) {

        localStorage.setItem(

            this.storageKey,

            JSON.stringify(student)

        );

    },

    load() {

        const data = localStorage.getItem(this.storageKey);

        if (!data) {

            return null;

        }

        return JSON.parse(data);

    },

    exists() {

        return localStorage.getItem(this.storageKey) !== null;

    },

    clear() {

        localStorage.removeItem(this.storageKey);

    },

    addXP(amount) {

        const student = this.load();

        if (!student) return;

        student.xp += amount;

        student.level = this.calculateLevel(student.xp);

        this.save(student);

    },

    calculateLevel(xp) {

        return Math.floor(xp / 100) + 1;

    },

    addBadge(badgeName) {

        const student = this.load();

        if (!student) return;

        if (!student.badges.includes(badgeName)) {

            student.badges.push(badgeName);

        }

        this.save(student);

    },

    completeGame(gameName) {

        const student = this.load();

        if (!student) return;

        if (!student.completedGames.includes(gameName)) {

            student.completedGames.push(gameName);

        }

        student.statistics.totalGames++;

        this.save(student);

    },

    updateStatistics(correct, wrong, seconds) {

        const student = this.load();

        if (!student) return;

        student.statistics.totalCorrect += correct;

        student.statistics.totalWrong += wrong;

        student.statistics.totalPlayTime += seconds;

        this.save(student);

    }

};

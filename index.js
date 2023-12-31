import fs from "fs";
import fetch from "node-fetch";
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Jakarta').locale('id');

const IDN_MemberId = JSON.parse(fs.readFileSync('members.json', 'utf8'));

async function fetchLivestreams(page = 1) {
    try {
        const url = new URL('https://mobile-api.idntimes.com/v3/livestreams');
        url.searchParams.append('category', 'all');
        url.searchParams.append('page', page);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Host': 'mobile-api.idntimes.com',
                'x-api-key': '1ccc5bc4-8bb4-414c-b524-92d11a85a818',
                'User-Agent': 'IDN/6.41.1 (com.idntimes.IDNTimes; build:745; iOS 17.2.1) Alamofire/5.1.0',
                'Connection': 'keep-alive',
                'Accept-Language': 'en-ID;q=1.0, id-ID;q=0.9',
                'Accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
}

async function getAllLivestreams(filterUuids) {
    let page = 1;
    let allLivestreams = [];
    let hasMore = true;

    while (hasMore) {
        const data = await fetchLivestreams(page);
        if (data.data.length === 0) {
            hasMore = false;
        } else {
            allLivestreams = allLivestreams.concat(data.data);
            page++;
        }
    }

    const filteredLivestreams = allLivestreams.filter(livestream =>
        filterUuids.includes(livestream.creator.uuid));

    return filteredLivestreams;
}

async function getLive() {
    try {
        const liveStreams = await getAllLivestreams(IDN_MemberId);

        if (liveStreams.length === 0) {
            return;
        }

        const filePath = 'history.txt';

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
        }

        const existingData = fs.readFileSync(filePath, 'utf8');

        await Promise.all(liveStreams.map(async (isLive) => {
            const judul = isLive.title;
            const startTimestamp = isLive.live_at;
            const started = moment.unix(startTimestamp).format("dddd, D MMM YYYY HH:mm:ss");
            const status = isLive.status;
            const memberName = isLive.creator.name.replace(" JKT48", "");
            if(status == "live"){
                const newData  = `${memberName} | ${judul} | ${started}`
                if (existingData.includes(newData)) {
                    console.log('Data already exists. Not appended to file.');
                } else {
                    fs.appendFileSync(filePath, newData + '\n');
                    console.log('Data appended to file successfully.');
                }
            }
        }));
    } catch (error) {
        console.log(`Fetch Error: ${error}`);
    }
}

await getLive();
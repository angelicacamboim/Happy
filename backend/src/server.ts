import express from 'express';
import { getRepository } from 'typeorm';
import Orphanage from './models/Orphanage';

import './database/connection';

const app = express();
app.use(express.json());

app.post('/orphanages', async (request, response) => {
    const {
        nome,
        latitude,
        longitude,
        about,
        instructions,
        opening_hours,
        open_on_weekends
    } = await request.body;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = orphanagesRepository.create({
        nome,
        latitude,
        longitude,
        about,
        instructions,
        opening_hours,
        open_on_weekends
    });

    await orphanagesRepository.save(orphanage);

    return response.json({message: 'Ola'});
});

app.listen(3333);
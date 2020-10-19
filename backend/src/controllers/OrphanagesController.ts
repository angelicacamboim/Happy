import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import Orphanage from '../models/Orphanage';
import orphanageView from '../views/orphanages_view';
import * as Yup from 'yup';

export default {
    async index(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(orphanageView.renderMany(orphanages));
    },

    async show(request: Request, response: Response) {
        const {id} = request.params;

        const orphanagesRepository = getRepository(Orphanage);

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return response.json(orphanageView.render(orphanage));
    },

    async create(request: Request, response: Response) {
        const {
            nome,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } = await request.body; //pega a requisição

        const requestImages = request.files as Express.Multer.File[];
        const images = requestImages.map(image => {
            return { path: image.filename }
        })// pega o array de imagens da requisição
    
        //get no repositorio: orphanage
        const orphanagesRepository = getRepository(Orphanage);
    
        const data = {
            nome,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            images
        };

        //Validação de campo em branco com YUP
        const schema = Yup.object().shape({
            nome: Yup.string().required('O nome é obrigatório'),
            latitude: Yup.number().required('A latitude é obrigatória'),
            longitude: Yup.number().required('A longitude é obrigatória'),
            about: Yup.string().required('Sobre é obrigatório').max(300),
            instructions: Yup.string().required('As instruções são obrigatórias'),
            opening_hours: Yup.string().required('A hora de abertura é obrigatória'),
            open_on_weekends: Yup.boolean().required('Abre nos finais de semanas é obrigatório'),
            images: Yup.array(Yup.object().shape({
                path: Yup.string().required('A imagem é obrigatória')
            })
        )
    });
        //valida se os campos estão em branco
        await schema.validate(data, {
            abortEarly: false,
        });
        
        //Quando todos os campos estiver sido preenchidos
        const orphanage = orphanagesRepository.create(data);
    
        //Salva no banco de dados
        await orphanagesRepository.save(orphanage);
    
        //Retorna uma resposta a lista 
        return response.status(201).json(orphanage);
    }
};
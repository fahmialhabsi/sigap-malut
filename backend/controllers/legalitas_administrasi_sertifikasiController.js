import BaseService from '../services/baseService.js';
export default function(models){
  const svc = new BaseService(models['legalitas_administrasi_sertifikasi']);
  return {
    create: async (req,res,next)=>{ try{ const r=await svc.create(req.body); return res.json(r);}catch(e){next(e)} },
    list: async (req,res,next)=>{ try{ const r=await svc.findAll(); return res.json(r);}catch(e){next(e)} },
    get: async (req,res,next)=>{ try{ const r=await svc.findById(req.params.id); return res.json(r);}catch(e){next(e)} }
  }
}

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing'

import { CaptchaService } from './captcha.service'

describe('CaptchaService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CaptchaService]
    })
  })

  it('should be created', inject([CaptchaService], (service: CaptchaService) => {
    expect(service).toBeTruthy()
  }))

  it('should get captcha directly from the rest api', inject([CaptchaService, HttpTestingController],
    fakeAsync((service: CaptchaService, httpMock: HttpTestingController) => {
      let res
      service.getCaptcha().subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/captcha/')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
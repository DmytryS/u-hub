[![Build Status](https://travis-ci.com/DmytryS/u-hub.svg?branch=development)](https://travis-ci.com/DmytryS/u-hub)

https://stackoverflow.com/questions/52430091/can-i-use-an-insecure-endpoint-for-kubernetes-api-in-docker-for-mac

Enable PodPreset on mac os
screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
vi /etc/kubernetes/manifests/kube-apiserver.yaml

add:

- --runtime-config=settings.k8s.io/v1alpha1=true
- --enable-admission-plugins=NamespaceLifecycle,LimitRanger,ServiceAccount,DefaultStorageClass,DefaultTolerationSeconds,NodeRestriction,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,ResourceQuota,PodPreset
